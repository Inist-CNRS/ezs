import path from 'path';
import cacache from 'cacache';
import { tmpdir } from 'os';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import mm from 'micromatch';
import { promises as fsp } from 'fs';

const EZS_STORAGE_PATH = process.env.EZS_STORAGE_PATH || tmpdir();
const encodeKey = (k) => k;
const encodeValue = (v) => JSON.stringify(v);
const decodeValue = (v) => JSON.parse(String(v));

function readContent(data, feed) {
    if (this.isLast()) {
        feed.close(); return;
    }
    fsp.readFile(data.path)
        .then((content) => feed.send(decodeValue(content)))
        .catch((e) => feed.stop(e));
}

export const batchList = () => fsp.readdir(EZS_STORAGE_PATH).then(
    (files) => files.filter((file) => (file.indexOf('store_') === 0)).map((file) => file.substring(6)),
);
export async function batchCheck(batch) {
    const existingBatchs = await batchList();
    const batchs = Array.isArray(batch) ? [batch] : batch;

    const matches = mm(existingBatchs, batchs);
    if (matches.length === 0 && batch.match(/\w+/)) {
        return [batch];
    }
    return matches;
}

export class Store {
    constructor(ezs, location) {
        this.location = location;
        this.ezs = ezs;
    }

    get(key) {
        return cacache.get(this.location, encodeKey(key)).then(({ data }) => Promise.resolve(decodeValue(data)));
    }

    set(key, value) {
        return cacache.put(this.location,
            encodeKey(key),
            encodeValue(value));
    }

    all(length) {
        const { ezs, location } = this;
        return cacache.ls.stream(location)
            .pipe(ezs(readContent))
            .pipe(ezs('truncate', { length }));
    }

    reset() {
        return cacache.rm.all(this.location);
    }
}

const handle = {};
export default async function factory(ezs, location) {
    if (!location) {
        return Promise.reject(new Error('Invalid location: undefined'));
    }
    const fullpath = path.resolve(EZS_STORAGE_PATH, `store_${location}`);
    const check = await pathExists(fullpath);

    if (!handle[fullpath] || check !== true) {
        await makeDir(fullpath);
        handle[fullpath] = new Store(ezs, fullpath);
    }
    return Promise.resolve(handle[fullpath]);
}
