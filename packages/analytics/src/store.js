import { totalmem, cpus } from 'os';
import pathExists from 'path-exists';
import tmpFilepath from 'tmp-filepath';
import makeDir from 'make-dir';
import lmdb from 'node-lmdb';

const maxDbs = cpus().length ** 2;
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
        this.dbi = lmdbEnv(this.ezs).openDbi({
            name: domain,
            create: true,
        });
    }

    get(key) {
        return new Promise((resolve) => {
            const txn = lmdbEnv(this.ezs).beginTxn({ readOnly: true });
            const ekey = encodeKey(key);
            const val = decodeValue(txn.getString(this.dbi, ekey));
            txn.commit();
            resolve(val);
        });
    }

    put(key, value) {
        return new Promise((resolve) => {
            const txn = lmdbEnv(this.ezs).beginTxn();
            const ekey = encodeKey(key);
            txn.putString(this.dbi, ekey, encodeValue(value));
            txn.commit();
            resolve(true);
        });
    }

    add(key, value) {
        return new Promise((resolve) => {
            const txn = lmdbEnv(this.ezs).beginTxn();
            const ekey = encodeKey(key);
            const vvalue = decodeValue(txn.getString(this.dbi, ekey));
            if (vvalue) {
                txn.putString(this.dbi, ekey, encodeValue(vvalue.concat(value)));
            } else {
                txn.putString(this.dbi, ekey, encodeValue([value]));
            }
            txn.commit();
            resolve(true);
        });
    }

    cast() {
        const flow = this.ezs.createStream(this.ezs.objectMode())
            .on('end', () => this.close());

        process.nextTick(() => {
            const txn = lmdbEnv(this.ezs).beginTxn({ readOnly: true });
            const cursor = new lmdb.Cursor(txn, this.dbi);
            for (let found = cursor.goToFirst();
                found !== null;
                found = cursor.goToNext()) {
                const id = decodeKey(found);
                const value = decodeValue(txn.getString(this.dbi, found));
                flow.write({ id, value });
            }
            flow.end();
            txn.commit();
        });
        return flow;
    }

    close() {
        return this.dbi.close();
    }
}
