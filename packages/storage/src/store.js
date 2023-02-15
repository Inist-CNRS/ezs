import { tmpdir } from 'os';
import { join } from 'path';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import { open } from 'lmdb';
import debug from 'debug';

const handles = {};
const lmdbEnv = (location) => {
    if (handles[location]) {
        return handles[location];
    }
    const path = join(location || tmpdir(), 'lmdb');
    debug('ezs')('Open lmdb in ', path);
    if (!pathExists.sync(path)) {
        makeDir.sync(path);
    }
    handles[location] = open({
        path,
        compression: true,
        commitDelay: 3000,
        noSync: true,
        noMemInit: true,
    });
    return handles[location];
};

export default class Store {
    constructor(ezs, domain, location) {
        this.ezs = ezs;
        this.domain = domain;
        this.location = location;
        this.open();
    }

    env() {
        return lmdbEnv(this.location);
    }

    open() {
        this.handle = this.env()
            .openDB(this.domain, {
                compression: true,
            });
    }

    dbi() {
        if (!this.handle) {
            this.open();
        }
        return this.handle;
    }

    get(key) {
        return Promise.resolve(this.dbi().get(key));
    }

    put(key, value) {
        return this.dbi().put(key, value);
    }

    add(key, value) {
        return this.dbi().put(key, value);
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
            this.dbi().getRange().forEach(({ key:id, value }) => {
                stream.write({ id, value });
            });
            stream.end();
        });
        return stream;
    }

    reset() {
        return this.dbi().clearAsync();
    }

    close() {
        this.dbi().close();
    }
}
