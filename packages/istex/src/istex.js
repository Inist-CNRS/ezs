import ezs from 'ezs';
import { PassThrough } from 'stream';
import os from 'os';
import queue from 'async.queue';
import { writeTo } from './utils';
import ISTEXScroll from './scroll';
import ISTEXResult from './istex-result';
import ISTEXFetch from './istex-fetch';


const worker = stream => (data, done) => {
    writeTo(stream, data, () => done());
};

const getAndWriteQueries = (data, options, feed) => new Promise(
    (resolve, reject) => {
        if (!Array.isArray(data)) {
            return reject(new Error('unexpected data. Should be an array.'));
        }
        if (data.length === 0) {
            return resolve();
        }
        const inputQuery = new PassThrough({
            writableObjectMode: true,
            readableObjectMode: true,
        });
        const q = queue(worker(inputQuery), os.cpus().length);
        q.drain = () => inputQuery.end();
        data.forEach(query => q.push({ query }));

        return inputQuery
            .pipe(ezs(ISTEXScroll, options))
            .pipe(ezs(ISTEXResult))
            .on('data', (chunk) => {
                feed.write(chunk);
            })
            .on('end', () => {
                resolve();
            })
            .on('error', (e) => {
                reject(e);
            });
    },
);

const getAndWriteIdentifiers = (data, options, feed) => new Promise(
    (resolve, reject) => {
        if (!Array.isArray(data)) {
            return reject(new Error('unexpected data. Should be an array.'));
        }
        if (data.length === 0) {
            return resolve();
        }
        const input = new PassThrough({
            writableObjectMode: true,
            readableObjectMode: true,
        });
        const q = queue(worker(input), os.cpus().length);
        q.drain = () => input.end();
        data.forEach(id => q.push({ id }));

        return input
            .pipe(ezs(ISTEXFetch, options))
            .on('data', (chunk) => {
                feed.write(chunk);
            })
            .on('end', () => {
                resolve();
            })
            .on('error', (e) => {
                reject(e);
            });
    },
);


/**
 * Take an array and returns matching documents for every value of the array
 *
 * @param {string|Array<string>} [query=data.query||[]] ISTEX query (or queries)
 * @param {string|Array<string>} [id=data.id||[]]   ISTEX id (or ids)
 * @param {number} maxPage  maximum number of pages to get
 * @param {number} size     size of each page of results
 * @param {string} duration maximum duration between two requests (ex: "30s")
 * @param {Array<Object>} field fields to output
 * @returns {Array<Object>}
 */
async function ISTEX(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const maxPage = this.getParam('maxPage');
    const size = this.getParam('size');
    const sid = this.getParam('sid');
    const scroll = this.getParam('duration');
    const field = this.getParam('field');
    const query = this.getParam('query', data.query || []);
    const queries = Array.isArray(query) ? query : [query];
    const identifier = this.getParam('id', data.id || []);
    const identifiers = Array.isArray(identifier) ? identifier : [identifier];
    const options = {
        query,
        maxPage,
        size,
        scroll,
        field,
        sid,
    };
    await getAndWriteQueries(queries, options, feed);
    await getAndWriteIdentifiers(identifiers, options, feed);
    feed.end();
}

export default {
    ISTEX,
};
