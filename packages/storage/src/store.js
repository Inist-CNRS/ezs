import { tmpdir } from 'os';
import { join } from 'path';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import { open } from 'lmdb';
import debug from 'debug';

const handles = {};
const singleton = (location) => {
    if (handles[location]) {
        return handles[location];
    }
    const path = join(location || tmpdir(), 'leveldb');
    debug('ezs')('Open store in ', path);
    if (!pathExists.sync(path)) {
        makeDir.sync(path);
    }

    handles[location] = path;

    return handles[location];
};


class AbstractStore {
    constructor(ezs, sdb) {
        this.ezs = ezs;
        this.handle = sdb;
    }

    get(key) {
        const k = JSON.stringify(key);
        const value = this.handle[k] ? this.handle[k] : null;
        return Promise.resolve(JSON.parse(value));
    }

    put(key, value) {
        const k = JSON.stringify(key);
        this.handle[k] = JSON.stringify(value);
        return Promise.resolve(true);
    }

    stream() {
        return this.cast();
    }

    empty() {
        return this.cast().on('end', () => this.reset());
    }

    cast() {
        const stream = this.ezs.createStream(this.ezs.objectMode());
        process.nextTick(() => {
            Object.keys(this.handle).forEach(key  => {
                stream.write({
                    id: JSON.parse(key),
                    value: JSON.parse(this.handle[key]),
                });
            });
            stream.end();
        });
        return stream;
    }

    reset() {
        Object.keys(this.handle).forEach(key  => {
            delete this.handle[key];
        });
    }

    close() {
        delete this.handle;
        return Promise.resolve(true);
    }
}


const memory = {};
export default async function store(ezs, domain, location) {

    const path = singleton(location);
    if (!memory[path]) {
        memory[path] = {};
    }
    if (!memory[path][domain]) {
        memory[path][domain] = {};
    }
    return new AbstractStore(ezs, memory[path][domain]);
}
