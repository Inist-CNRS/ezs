import JSONStream from 'JSONStream';
import { Readable } from 'stream';
import from from 'from';
import debug from 'debug';
import writeTo from 'stream-write';
import parseHeaders from 'parse-headers';
import retry from 'async-retry';
import getStream from 'get-stream';

const restMethods = ['POST', 'GET', 'DELETE', 'PUT', 'PATCH', 'HEAD', 'OPTIONS' , 'TRACE'];
/**
 * Take an `Object` and send it to an URL.
 *
 * The output will be the returned content of URL.
 *
 * Useful to send JSON data to an API and get results.
 *
 * @name URLConnect
 * @param {String} [url] URL to fetch
 * @param {String} [streaming=false] Direct connection to the Object Stream server (disables the retries setting)
 * @param {String} [json=false] Parse as JSON the content of URL
 * @param {Number} [timeout=5000] Timeout in milliseconds
 * @param {Boolean} [noerror=false] Ignore all errors
 * @param {Number} [retries=5] The maximum amount of times to retry the connection
 * @param {String} [encoder=dump] The statement to encode each chunk to a string
 * @param {String} [method=POST] The method to use for the HTTP request
 * @returns {Object}
 */
export default async function URLConnect(data, feed) {
    const url = this.getParam('url');
    const streaming = Boolean(this.getParam('streaming', false));
    const retries = Number(this.getParam('retries', 5));
    const noerror = Boolean(this.getParam('noerror', false));
    const method = ['POST'].concat(this.getParam('method')).filter(item => restMethods.includes(item)).pop();
    const json = this.getParam('json', true);
    const encoder = this.getParam('encoder', 'dump');
    const { ezs } = this;
    if (this.isFirst()) {
        const timeout = Number(this.getParam('timeout', 5000));
        const headers = parseHeaders([]
            .concat(this.getParam('header'))
            .filter(Boolean)
            .join('\n'));
        this.input = ezs.createStream(ezs.objectMode());
        const output = ezs.createStream(ezs.objectMode());
        this.whenFinish = feed.flow(output);

        writeTo(this.input, data, () => feed.end());
        const streamIn = this.input.pipe(ezs(encoder));
        let bodyIn;
        if (streaming) {
            bodyIn = streamIn.pipe(ezs.toBuffer());
        } else {
            bodyIn = await getStream(streamIn);
            headers['Content-Type'] = 'application/json';
        }
        const parameters = {
            timeout,
            method,
            body: bodyIn,
            headers,
        };
        const controller = new AbortController();
        try {
            await retry(
                async (bail, numberOfTimes) => {
                    if (numberOfTimes > 1) {
                        debug('ezs:debug')(`Attempts to reconnect (${numberOfTimes})`);
                    }
                    const hasBody = parameters.body !== undefined;
                    const response = await fetch(url, {
                        ...parameters,
                        ...(hasBody && { duplex: 'half' }),
                        signal: AbortSignal.any([
                            controller.signal,
                            AbortSignal.timeout(timeout),
                        ]),
                    });

                    if (!response.ok) {
                        const err = new Error(response.statusText);
                        const text = await response.text();
                        err.responseText = text;
                        throw err;
                    }

                    const bodyStream = Readable.fromWeb(response.body);
                    if (streaming) {
                        const bodyOut = json ? bodyStream.pipe(JSONStream.parse('*')) : bodyStream;
                        bodyOut.once('error', (e) => {
                            output.emit('error', e);
                            //controller.abort();
                        });
                        return bodyOut.pipe(output);
                    }
                    if (json) {
                        const bodyOutRaw = await getStream(bodyStream);
                        if (bodyOutRaw === '') {
                            throw new Error('URL returned an empty response');
                        }
                        let bodyOutArray;
                        try {
                            bodyOutArray = JSON.parse(bodyOutRaw);
                        }
                        catch (e) {
                            throw new Error(`URL returned an invalid JSON response (${bodyOutRaw})`);
                        }
                        return from(bodyOutArray).pipe(output);
                    }
                    return bodyStream.pipe(output);
                },
                {
                    retries: streaming ? 0 : retries,
                }
            );
        }
        catch (e) {
            controller.abort();
            const standardError = new Error(e.message);  // use standard error (not DOMException)
            if (noerror) {
                debug('ezs:info')(`Ignore item #${this.getIndex()} [URLConnect]`, this.ezs.serializeError(standardError));
                return feed.send(data);
            }
            debug('ezs:warn')(`Break item #${this.getIndex()} [URLConnect]`, this.ezs.serializeError(standardError));
            feed.send(standardError);
            output.end();
        };
        return;
    }
    if (this.isLast()) {
        this.input.end();
        this.whenFinish.finally(() => {
            feed.close();
        });
        return;
    }
    writeTo(this.input, data, () => feed.end());
}
