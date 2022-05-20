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
        this.persistent = (identifier.indexOf('persistent') === 0);
        this.directory = path.resolve(location || tmpdir(), 'store', identifier);
        if (!pathExists.sync(this.directory)) {
            this.created = true;
            makeDir.sync(this.directory);
        }
        debug('ezs')(`DB from ${this.directory}`, (this.created ? 'was created' : 'already exists'));
        this.ready = new Promise((resolve, reject) => {
            if (!handle[this.directory]) {
                levelup(leveldown(this.directory), {}, (err, db) => {
                    if (err) {
                        return reject(err);
                    }
                    handle[this.directory] = db;
                    this.handle = db;
                    return resolve(true);
                });
            } else {
                this.handle = handle[this.directory];
                return resolve(true);
            }
        });
        this.hdb = (cb) => this.ready.then(() => {
            if (!this.handle) return cb(new Error('Store was closed'));
            if (!this.handle.isOperational()) return cb(new Error('Store is not operational'));
            return cb(null, this.handle);
        }).catch(cb);
    }

    isCreated() {
        return this.created;
    }

    id() {
        return this.identifier;
    }

    get(key) {
        return new Promise((resolve, reject) => {
            this.hdb((fail, db) => {
                if (fail) {
                    return reject(fail);
                }
                return db.get(encodeKey(key), (err, value) => {
                    if (err) {
                        if (err.notFound) {
                            return resolve(null);
                        }
                        return reject(err);
                    }
                    return resolve(decodeValue(value));
                });
            });
        });
    }

    cut(key1) {
        return new Promise((resolve, reject) => {
            const key2 = encodeKey(key1);
            this.hdb((fail, db) => {
                if (fail) {
                    return reject(fail);
                }
                return db.get(key2, (err1, value) => {
                    if (err1) {
                        if (err1.notFound) {
                            console.error('WARNING', err1);
                            return resolve(null);
                        }
                        return reject(err1);
                    }
                    return db.del(key2, (err2) => {
                        if (err2) {
                            console.error('WARNING', err2);
                        }
                        return resolve(decodeValue(value));
                    });
                });
            });
        });
    }


    put(key, value) {
        return new Promise((resolve, reject) => {
            this.hdb((fail, db) => {
                if (fail) {
                    return reject(fail);
                }
                return db.put(encodeKey(key), encodeValue(value), (err) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(true);
                });
            });
        });
    }

    add(key, value) {
        return new Promise((resolve, reject) => {
            this.hdb((fail, db) => {
                if (fail) {
                    return reject(fail);
                }
                return db.get(encodeKey(key), (err, vv) => {
                    let vvalue = vv;
                    if (err) {
                        vvalue = null;
                    }
                    if (vvalue) {
                        return db.put(encodeKey(key), encodeValue(decodeValue(vvalue).concat(value)), (err2) => {
                            if (err2) {
                                return reject(err2);
                            }
                            return resolve(true);
                        });
                    }
                    return db.put(encodeKey(key), encodeValue([value]), (err2) => {
                        if (err2) {
                            return reject(err2);
                        }
                        return resolve(true);
                    });
                });
            });
        });
    }

    async empty() {
        const stream = await this.cast();
        return stream
            .on('end', async () => {
                await this.handle.clear();
            });
    }

    cast() {
        return new Promise((resolve, reject) => {
            this.hdb((fail, db) => {
                if (fail) {
                    return reject(fail);
                }
                return resolve(db.createReadStream().pipe(this.ezs(decodeObject)));
            });
        });
    }

    reset() {
        return new Promise((resolve, reject) => {
            this.hdb((fail, db) => {
                if (fail) {
                    return reject(fail);
                }
                return db.clear(null, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(true);
                });
            });
        });
    }

    async close() {
        debug('ezs')(`DB from ${this.directory} is closing`);
        delete handle[this.directory];
        if (!this.handle) {
            return del([this.directory], { force: true });
        }
        if (!this.persistent) {
            debug('ezs')(`DB from ${this.directory} is clearing`);
            await this.handle.clear();
            await this.handle.close();
            await del([this.directory], { force: true });
        } else {
            await this.handle.close();
        }
        return true;
    }
}

export function createStore(ezs, domain, location) {
    return new Store(ezs, `${domain}/${uuid()}/${process.pid}`, location);
}
export function createPersistentStore(ezs, domain, location) {
    return new Store(ezs, `persistent/${domain}`, location);
}
export function createStoreWithID(ezs, identifier, location) {
    return new Store(ezs, identifier, location);
}
