import path from 'path';
import { tmpdir } from 'os';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import debug from 'debug';
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
        const directory = path.resolve(location || tmpdir(), 'store', identifier);
        if (!pathExists.sync(directory)) {
            this.created = true;
            makeDir.sync(directory);
        }
        debug('ezs')(`DB from ${directory}`, (this.created ? 'was created' : 'already exists'));
        if (!handle[directory]) {
            handle[directory] = levelup(leveldown(directory));
        }
        this.db = handle[directory];
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
        return true;
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
