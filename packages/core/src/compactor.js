import { DEBUG } from './constants';
import { PassThrough } from 'stream';

const resolve = (name) => {
    try {
        require.resolve(name);
        return true;
    } catch(e) {
        return false;
    }
}

const chooseZ = () => {
    if (resolve('node-zstd')) {
         DEBUG('ezs will use zstd to compress/uncompress stream.');
        return require('node-zstd')
    }
    else if (resolve('zlib')) {
        DEBUG('ezs will use zlib to compress/uncompress stream.');
        return require('zlib');
    }
    else {
        DEBUG('ezs will not compress/uncompress stream.');
        return;
    }
}

const z = chooseZ();

export function compressStream(ezs) {
    if (typeof z.createGunzip === 'function') {
        return z.createGzip();
    } else if (typeof z.compressStream === 'function') {
        return z.compressStream();
    } else {
        return new PassThrough(ezs.bytesMode());
    }
}

export function uncompressStream() {
    if (typeof z.createGunzip === 'function') {
        return z.createGunzip();
    } else if (typeof z.compressStream === 'function') {
        return z.decompressStream();
    } else {
        return new PassThrough(ezs.bytesMode());
    }
}
