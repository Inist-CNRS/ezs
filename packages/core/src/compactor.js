import { PassThrough } from 'stream';
import { DEBUG } from './constants';

const resolve = (name) => {
    try {
        require.resolve(name);
        return true;
    } catch (e) {
        return false;
    }
};

const chooseZ = () => {
    if (resolve('node-zstd')) {
        DEBUG('ezs will use zstd to compress/uncompress stream.');
        // eslint-disable-next-line
        return require('node-zstd');
    }
    if (resolve('zlib')) {
        DEBUG('ezs will use zlib to compress/uncompress stream.');
        // eslint-disable-next-line
        return require('zlib');
    }
    DEBUG('ezs will not compress/uncompress stream.');
    return null;
};

const z = chooseZ();

export function compressStream(ezs) {
    if (typeof z.createGunzip === 'function') {
        return z.createGzip();
    } if (typeof z.compressStream === 'function') {
        return z.compressStream();
    }
    return new PassThrough(ezs.bytesMode());
}

export function uncompressStream(ezs) {
    if (typeof z.createGunzip === 'function') {
        return z.createGunzip();
    } if (typeof z.compressStream === 'function') {
        return z.decompressStream();
    }
    return new PassThrough(ezs.bytesMode());
}
