import { join } from 'path';
import { tmpdir, totalmem, cpus } from 'os';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import lmdb from 'node-lmdb';

const EZS_STORAGE_PATH = process.env.EZS_STORAGE_PATH || tmpdir();
const maxDbs = cpus().length ** 2;
const mapSize = totalmem() / 2;
let handle;
export const validKey = (input) => (Boolean(input) && typeof input === 'string' && input.search(/\w+:(\/?\/?)[^\s]+/g) >= 0);
export const encodeKey = (k) => k;
export const encodeValue = (v) => JSON.stringify(v);
export const decodeValue = (v) => JSON.parse(String(v));
export const lmdbEnv = () => {
    if (handle) {
        return handle;
    }
    const path = join(EZS_STORAGE_PATH, 'store');
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
