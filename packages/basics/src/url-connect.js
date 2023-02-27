import JSONStream from 'JSONStream';
import from from 'from';
import debug from 'debug';
import writeTo from 'stream-write';
import AbortController from 'node-abort-controller';
import parseHeaders from 'parse-headers';
import retry from 'async-retry';
import getStream from 'get-stream';
import fetch from 'fetch-with-proxy';

/**
 * Take an `Object` and send it to an URL.
 *
 * The output will be the returned content of URL.
 *
 * Useful to send JSON data to an API and get results.
 *
 * Warning :
 * if retries === 1,  it will directly use the stream
 * to connect to the server otherwise the stream will be fully
 * read to be buffered and sent to the server (n times)
 *
 * @name URLConnect
 * @param {String} [url] URL to fetch
 * @param {String} [json=false] Parse as JSON the content of URL
 * @param {Number} [timeout=1000] Timeout in milliseconds
 * @param {Boolean} [noerror=false] Ignore all errors
 * @param {Number} [retries=5] The maximum amount of times to retry the connection
 * @returns {Object}
 */
export default async function URLConnect(data, feed) {
    const url = this.getParam('url');
    const retries = Number(this.getParam('retries', 5));
    const noerror = Boolean(this.getParam('noerror', false));
    const json = this.getParam('json', true);
    const { ezs } = this;
    if (this.isFirst()) {
        const timeout = Number(this.getParam('timeout')) || 1000;
        const headers = parseHeaders([]
            .concat(this.getParam('header'))
            .filter(Boolean)
            .join('\n'));
        this.input = ezs.createStream(ezs.objectMode());
        const output = ezs.createStream(ezs.objectMode());
        this.whenFinish = feed.flow(output);

        writeTo(this.input, data, () => feed.end());
        const streamIn = this.input.pipe(ezs('dump'));
        let bodyIn;
        if (retries === 1) {
            bodyIn = streamIn.pipe(ezs.toBuffer());
        } else {
            bodyIn = await getStream(streamIn);
            headers['Content-Type'] = 'application/json';
        }
        const parameters = {
            timeout,
            method: 'POST',
            body: bodyIn,
            headers,
        };
        try {
            await retry(
                async (bail, numberOfTimes) => {
                    if (numberOfTimes > 1) {
                        debug('ezs')(`Attempts to reconnect (${numberOfTimes})`);
                    }
                    const controller = new AbortController();
                    const response = await fetch(url, {
                        ...parameters,
                        signal: controller.signal,
                    });

                    if (!response.ok) {
                        const err = new Error(response.statusText);
                        const text = await response.text();
                        err.responseText = text;
                        throw err;
                    }

                    if (retries === 1) {
                        const bodyOut = json ? response.body.pipe(JSONStream.parse('*')) : response.body;
                        bodyOut.once('error', (e) => {
                            controller.abort();
                            output.emit('error', e);
                        });
                        bodyOut.pipe(output);
                    } else {
                        const bodyOutRaw = await getStream(response.body);
                        const bodyOutArray = JSON.parse(bodyOutRaw);
                        from(bodyOutArray).pipe(output);
                    }
                },
                {
                    retries,
                }
            );
        }
        catch (e) {
            if (!noerror) {
                debug('ezs')(
                    `Break item #${this.getIndex()} [URLConnect] <${e}>`,
                );
                feed.stop(e);
            } else {
                debug('ezs')(
                    `Ignore item #${this.getIndex()} [URLConnect] <${e}>`,
                );
            }
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
