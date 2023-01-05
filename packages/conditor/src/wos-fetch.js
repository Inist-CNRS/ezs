/* istanbul ignore file */
import debug from 'debug';
import { URL, URLSearchParams } from 'url';
import AbortController from 'node-abort-controller';
import get from 'lodash.get';
import retry from 'async-retry';
import fetch from 'fetch-with-proxy';
import writeTo from 'stream-write';
import each from 'async-each-series';

const request = (url, parameters) => async (bail, attempt) => {
    debug('ezs')(`Request #${attempt} to ${url}`);
    const response = await fetch(url, parameters);
    if (!response.ok) {
        const { code, message } = await response.json();
        throw new Error(`${code} - ${message}`);
    }
    return response;
};

const wait = (delay = 0) => new Promise((resolve) => setTimeout(resolve, delay * 1000));

const write = (output, notices) => new Promise((resolve, reject) => each(
    notices,
    (notice, next) => writeTo(output, notice, next),
    (err) => (err ? reject(err) : resolve(true)),
));

/**
 * Take `String` as URL, throw each chunk from the result
 *
 *
 * Input:
 *
 * ```json
 * [
 *   { q: "toto" },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [WOSFetch]
 * token = SDQedaeaazedsqsd
 * ```
 *
 * Output:
 *
 * ```json
 * [{...}, {"a": "b"}, {"a": "c" }]
 * ```
 *
 * @name WOSFetch
 * @param {String} [url=https://wos-api.clarivate.com/api/wos] corhal api url
 * @param {String} [token] WOS API TOKEN
 * @param {Number} [timeout=1000] Timeout in milliseconds
 * @param {Number} [retries=5] The maximum amount of times to retry the connection
 * @returns {Object}
 */
export default async function WOSFetch(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { ezs } = this;
    const url = String(this.getParam('url', 'https://wos-api.clarivate.com/api/wos'));
    const token = String(this.getParam('token'));
    const step = Number(this.getParam('step', 10));
    const retries = Number(this.getParam('retries', 5));
    const timeout = Number(this.getParam('timeout')) || 1000;
    const cURL = new URL(url);
    data.count = 0;
    data.firstRecord = 1;
    cURL.search = new URLSearchParams(data);
    let firstRecord = 1;
    const controller = new AbortController();
    const headers = {
        'X-ApiKey': token,
    };
    const parameters = {
        timeout,
        headers,
        signal: controller.signal,
    };
    const options = {
        retries,
    };
    const onError = (e) => {
        controller.abort();
        debug('ezs')(`Break item #${this.getIndex()} [WOSFetch] <${e}>`);
        return feed.stop(e);
    };
    const loop = async (stream, Records, reqPerSec, amtPerYear, QueryID, RecordsFound) => {
        if (Number(amtPerYear) <= 1) {
            throw new Error('No more download available');
        }
        if (Records && Records.length > 0) {
            try {
                await write(stream, Records);
            } catch (e) {
                console.error(`Write Error`, e.message);
                return stream.end();
            }
        }
        if (QueryID) {
            const cURLBis = new URL(`${url}/query/${QueryID}`);
            const dataBis = { ...data };
            dataBis.count = step;
            dataBis.firstRecord = firstRecord;
            if (firstRecord > RecordsFound) {
                return stream.end();
            }
            firstRecord += step; // for the next loop
            cURLBis.search = new URLSearchParams(dataBis);
            try {
                await wait(reqPerSec);
                const responseBis = await retry(request(cURLBis.href, parameters), options);
                const jsonResponseBis = await responseBis.json();
                const RecordsBis = get(jsonResponseBis, 'Records.records.REC');
                loop(stream, RecordsBis, reqPerSec, amtPerYear, QueryID, RecordsFound);
            } catch (e) {
                console.error(`Error with ${cURLBis.href}`, e.message);
                stream.end();
            }
        } else {
            return stream.end();
        }
    };
    try {
        const output = ezs.createStream(ezs.objectMode());
        const response = await retry(request(cURL.href, parameters), options);
        const jsonResponse = await response.json();
        const reqPerSec = response.headers.get('x-req-reqpersec-remaining');
        const amtPerYear = response.headers.get('x-rec-amtperyear-remaining');
        const QueryID = get(jsonResponse, 'QueryResult.QueryID');
        const RecordsFound = get(jsonResponse, 'QueryResult.RecordsFound');
        debug('ezs')(`Query #${QueryID} should download ${RecordsFound} notices (Allowed downloads remaining : ${amtPerYear})`);
        await loop(output, [], reqPerSec, amtPerYear, QueryID, RecordsFound);
        await feed.flow(output);
    } catch (e) {
        onError(e);
    }
}
