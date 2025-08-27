import { PassThrough } from 'readable-stream';
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
    if (resolve('zlib')) {
        // eslint-disable-next-line
        return require('zlib');
    }
    return null;
};

const z = chooseZ();

export function compressStream(ezs, opts = {}) {
    const encoding = opts['Content-Encoding'] || opts['content-encoding'] || 'identity';
    if (z && typeof z.createGunzip === 'function' && encoding === 'gzip') {
        debug('ezs:debug')('ezs will use zlib to compress stream.');
        return z.createGzip();
    }
    debug('ezs:debug')('ezs will not compress stream.');
    return new PassThrough(ezs.bytesMode());
}

export function uncompressStream(ezs, opts = {}) {
    const encoding = opts['Content-Encoding'] || opts['content-encoding'] || 'identity';
    if (z && typeof z.createGunzip === 'function' && encoding === 'gzip') {
        debug('ezs:debug')('ezs will use zlib to uncompress stream.');
        return z.createGunzip();
    }
    debug('ezs:debug')('ezs will not uncompress stream.');
    return new PassThrough(ezs.bytesMode());
}
