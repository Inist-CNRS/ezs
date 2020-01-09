import path from 'path';
import cacache from 'cacache';
import { tmpdir } from 'os';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import { promises as fsp } from 'fs';

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
    const fullpath = path.resolve(tmpdir(), `store_${location}`);
    const check = await pathExists(fullpath);

    if (!handle[fullpath] || check !== true) {
        await makeDir(fullpath);
        handle[fullpath] = new Store(ezs, fullpath);
    }
    return Promise.resolve(handle[fullpath]);
}
