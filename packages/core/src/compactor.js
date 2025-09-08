import { PassThrough } from 'readable-stream';
import debug from 'debug';
import zlib from 'zlib';

export function compressStream(ezs, opts = {}) {
    const encoding = opts['Content-Encoding'] || opts['content-encoding'] || 'identity';
    if (typeof zlib.createGzip === 'function' && encoding === 'gzip') {
        debug('ezs:debug')('ezs will use zlib to compress stream.');
        return zlib.createGzip();
    }
    debug('ezs:debug')('ezs will not compress stream.');
    return new PassThrough(ezs.bytesMode());
}

export function uncompressStream(ezs, opts = {}) {
    const encoding = opts['Content-Encoding'] || opts['content-encoding'] || 'identity';
    if (typeof zlib.createGunzip === 'function' && encoding === 'gzip') {
        debug('ezs:debug')('ezs will use zlib to uncompress stream.');
        return zlib.createGunzip();
    }
    debug('ezs:debug')('ezs will not uncompress stream.');
    return new PassThrough(ezs.bytesMode());
}
