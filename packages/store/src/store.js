import path from 'path';
import { tmpdir } from 'os';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import debug from 'debug';
import del from 'del';
import uuid from 'uuid-random';

import levelup from 'levelup';
import leveldown from 'leveldown';

const encodeKey = (k) => JSON.stringify(k);
const encodeValue = (v) => JSON.stringify(v);
const decodeKey = (v) => JSON.parse(String(v));
const decodeValue = (v) => JSON.parse(String(v));

function decodeObject(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return feed.send({
        id: decodeKey(data.key),
        value: decodeValue(data.value),
    });
}

const handle = {};

class Store {
    constructor(ezs, identifier, location) {
        this.ezs = ezs;
        this.identifier = identifier;
        this.created = false;
        this.directory = path.resolve(location || tmpdir(), 'store', identifier);
        if (!pathExists.sync(this.directory)) {
            this.created = true;
            makeDir.sync(this.directory);
        }
        debug('ezs')(`DB from ${this.directory}`, (this.created ? 'was created' : 'already exists'));
        if (!handle[this.directory]) {
            handle[this.directory] = levelup(leveldown(this.directory));
        }
        this.db = handle[this.directory];
    }

    isCreated() {
        return this.created;
    }

    id() {
        return this.identifier;
    }

    get(key) {
        return new Promise((resolve, reject) => {
            this.db.get(encodeKey(key), (err, value) => {
                if (err) {
                    if (err.notFound) {
                        return resolve(null);
                    }
                    return reject(err);
                }
                return resolve(decodeValue(value));
            });
        });
    }

    cut(key1) {
        return new Promise((resolve, reject) => {
            const key2 = encodeKey(key1);
            this.db.get(key2, (err1, value) => {
                if (err1) {
                    if (err1.notFound) {
                        return resolve(null);
                    }
                    return reject(err1);
                }
                return this.db.del(key2, (err2) => {
                    if (err2) {
                        console.error('WARNING', err2);
                    }
                    return resolve(decodeValue(value));
                });
            });
        });
    }


    put(key, value) {
        return new Promise((resolve, reject) => {
            this.db.put(encodeKey(key), encodeValue(value), (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve(true);
            });
        });
    }

    add(key, value) {
        return new Promise((resolve, reject) => {
            this.db.get(encodeKey(key), (err, vv) => {
                let vvalue = vv;
                if (err) {
                    vvalue = null;
                }
                if (vvalue) {
                    return this.db.put(encodeKey(key), encodeValue(decodeValue(vvalue).concat(value)), (err2) => {
                        if (err2) {
                            return reject(err2);
                        }
                        return resolve(true);
                    });
                }
                return this.db.put(encodeKey(key), encodeValue([value]), (err2) => {
                    if (err2) {
                        return reject(err2);
                    }
                    return resolve(true);
                });
            });
        });
    }

    stream() {
        return this.cast();
    }

    empty() {
        return this.cast().on('end', () => this.reset());
    }

    cast() {
        return this.db.createReadStream().pipe(this.ezs(decodeObject));
    }

    reset() {
        return new Promise((resolve, reject) => {
            this.db.clear(null, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve(true);
            });
        });
    }

    close() {
        delete handle[this.directory];
        return Promise.all([
            this.db.clear(),
            this.db.close(),
            del([this.directory], { force: true }),
        ]);
    }
}

export function createStore(ezs, domain, location) {
    return new Store(ezs, `${domain}/${uuid()}/${process.pid}`, location);
}
export function createPersistentStore(ezs, domain, location) {
    return new Store(ezs, `persistent/${domain}/${process.pid}`, location);
}
export function createStoreWithID(ezs, identifier, location) {
    return new Store(ezs, identifier, location);
}
