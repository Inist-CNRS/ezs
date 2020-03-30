import { totalmem, cpus } from 'os';
import pathExists from 'path-exists';
import tmpFilepath from 'tmp-filepath';
import makeDir from 'make-dir';
import lmdb from 'node-lmdb';

const maxDbs = cpus().length * 10;
const mapSize = totalmem() / 2;
const encodeKey = (k) => JSON.stringify(k);
const decodeKey = (k) => JSON.parse(String(k));
const encodeValue = (v) => JSON.stringify(v);
const decodeValue = (v) => JSON.parse(String(v));
let handle;
const lmdbEnv = () => {
    if (handle) {
        return handle;
    }
    const path = tmpFilepath('store');
    if (!pathExists.sync(path)) {
        makeDir.sync(path);
    }
    handle = new lmdb.Env();
    handle.open({
        path,
        mapSize,
        maxDbs,
    });
    return handle;
};


export default class Store {
    constructor(ezs, domain) {
        this.ezs = ezs;
        this.domain = domain;
        this.open();
    }

    open() {
        this.handle = lmdbEnv().openDbi({
            name: this.domain,
            create: true,
        });
    }

    dbi() {
        return this.handle;
    }

    get(key) {
        return new Promise((resolve, reject) => {
            const txn = lmdbEnv().beginTxn({ readOnly: true });
            const ekey = encodeKey(key);
            try {
                const val = decodeValue(txn.getString(this.dbi(), ekey));
                txn.abort();
                resolve(val);
            } catch (e) {
                txn.abort();
                reject(e);
            }
        });
    }

    put(key, value) {
        return new Promise((resolve, reject) => {
            const txn = lmdbEnv().beginTxn();
            const ekey = encodeKey(key);
            try {
                txn.putString(this.dbi(), ekey, encodeValue(value));
            } catch (e) {
                txn.abort();
                reject(e);
            }
            txn.commit();
            resolve(true);
        });
    }

    add(key, value) {
        return new Promise((resolve, reject) => {
            const txn = lmdbEnv().beginTxn();
            const ekey = encodeKey(key);
            const vvalue = decodeValue(txn.getString(this.dbi(), ekey));
            try {
                if (vvalue) {
                    txn.putString(this.dbi(), ekey, encodeValue(vvalue.concat(value)));
                } else {
                    txn.putString(this.dbi(), ekey, encodeValue([value]));
                }
            } catch (e) {
                txn.abort();
                reject(e);
            }
            txn.commit();
            resolve(true);
        });
    }

    stream() {
        return this.cast();
    }

    empty() {
        return this.cast().on('end', () => this.reset());
    }

    cast() {
        const flow = this.ezs.createStream(this.ezs.objectMode());

        process.nextTick(() => {
            const txn = lmdbEnv(this.ezs).beginTxn({ readOnly: true });
            const cursor = new lmdb.Cursor(txn, this.dbi());
            const walker = (found, done) => {
                if (found) {
                    const id = decodeKey(found);
                    const value = decodeValue(txn.getString(this.dbi(), found));
                    this.ezs.writeTo(flow, { id, value }, (err, writable) => {
                        if (err || writable === false) {
                            return done();
                        }
                        return walker(cursor.goToNext(), done);
                    });
                } else {
                    done();
                }
            };
            walker(cursor.goToFirst(), () => {
                flow.end();
                txn.abort();
            });
        });
        return flow;
    }

    reset() {
        this.dbi().drop();
        this.open();
    }

    close() {
        this.dbi().close();
    }
}
