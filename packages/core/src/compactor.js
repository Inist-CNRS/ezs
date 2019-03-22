import { PassThrough } from 'stream';
import debug from 'debug';

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
        // eslint-disable-next-line
        return require('node-zstd');
    }
    if (resolve('zlib')) {
        // eslint-disable-next-line
        return require('zlib');
    }
    return null;
};

const z = chooseZ();

export function compressStream(ezs, opts = {}) {
    const encoding = opts['Content-Encoding'] || opts['content-encoding'] || 'identity';
    if (typeof z.createGunzip === 'function' && encoding === 'gzip') {
        debug('ezs')('ezs will use zlib to compress stream.');
        return z.createGzip();
    } if (typeof z.compressStream === 'function' && encoding === 'zstd') {
        debug('ezs')('ezs will use zstd to compress stream.');
        return z.compressStream();
    }
    debug('ezs')('ezs will not compress stream.');
    return new PassThrough(ezs.bytesMode());
}

export function uncompressStream(ezs, opts = {}) {
    const encoding = opts['Content-Encoding'] || opts['content-encoding'] || 'identity';
    if (typeof z.createGunzip === 'function' && encoding === 'gzip') {
        debug('ezs')('ezs will use zlib to uncompress stream.');
        return z.createGunzip();
    } if (typeof z.compressStream === 'function' && encoding === 'zstd') {
        debug('ezs')('ezs will use zstd to uncompress stream.');
        return z.decompressStream();
    }
    debug('ezs')('ezs will not uncompress stream.');
    return new PassThrough(ezs.bytesMode());
}
