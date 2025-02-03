/* istanbul ignore file */
import debug from 'debug';
import { URL, URLSearchParams } from 'url';
import AbortController from 'node-abort-controller';
import { get } from 'lodash';
import retry from 'async-retry';
import fetch from 'fetch-with-proxy';
import writeTo from 'stream-write';

const request = (url, parameters) => async (bail, attempt) => {
    debug('ezs:debug')(`Request #${attempt} to ${url}`);
    const response = await fetch(url, parameters);
    if (!response.ok) {
        const { message } = await response.json();
        throw new Error(`${response.status} ${response.statusText} - ${message}`);
    }
    return response;
};

const wait = (delay = 0) => new Promise((resolve) => setTimeout(resolve, delay * 1000));

const write = (output, notice) => new Promise((resolve, reject) => writeTo(output, notice, (err) => (err ? reject(err) : resolve(true))));

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
        debug('ezs:warn')(`Break item #${this.getIndex()} [WOSFetch]`, ezs.serializeError(e));
        return feed.stop(e);
    };
    let RecordsCount = 0;
    const loop = async (stream, Records, reqPerSec, amtPerYear, QueryID, RecordsFound) => {
        if (Number(amtPerYear) <= 1) {
            throw new Error('No more download available');
        }
        if (Records && Records.length > 0) {
            try {
                const RecordsToWrite = Records.map(record => write(stream, record));
                await Promise.all(RecordsToWrite);
                RecordsCount += RecordsToWrite.length;
                debug('ezs:debug')('Recovered', RecordsCount, '/', RecordsFound);
            } catch (e) {
                debug('ezs:error')('Write Error', ezs.serializeError(e));
                throw new Error(e);
            }
        }
        if (!QueryID) {
            throw new Error('QueryID was lost');
        }
        const cURLBis = new URL(`${url}/query/${QueryID}`);
        try {
            const RecordsBis = await retry(async (bail, attempt) => {
                const dataBis = { ...data };
                dataBis.count = step;
                dataBis.firstRecord = firstRecord;
                if (firstRecord > RecordsFound) {
                    return [];
                }
                firstRecord += step; // for the next loop
                cURLBis.search = new URLSearchParams(dataBis);
                await wait(reqPerSec);
                const responseBis = await request(cURLBis.href, parameters)(bail, attempt);
                const jsonResponseBis = await responseBis.json();
                return get(jsonResponseBis, 'Records.records.REC', []);
            }, options);
            if (!RecordsBis || RecordsBis.length === 0) {
                return stream.end();
            }
            await loop(stream, RecordsBis, reqPerSec, amtPerYear, QueryID, RecordsFound);
        } catch (e) {
            debug('ezs:error')(`Error with ${cURLBis.href}`, ezs.serializeError(e));
            throw new Error(e);
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
        debug('ezs:debug')(`Query #${QueryID} should download ${RecordsFound} notices (Allowed downloads remaining : ${amtPerYear})`);
        feed.flow(output);
        await loop(output, [], reqPerSec, amtPerYear, QueryID, RecordsFound);
    } catch (e) {
        onError(e);
    }
}
