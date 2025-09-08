import { PassThrough } from 'readable-stream';
import debug from 'debug';

const chooseZ = async () => {
    try {
        return await import('zlib');
    } catch (e) {
        debug('ezs:debug')('Unable to load zlib', e);
        return null;
    }
}

const z = await chooseZ();

export function compressStream(ezs, opts = {}) {
    const encoding = opts['Content-Encoding'] || opts['content-encoding'] || 'identity';
    if (z && typeof z.createGzip === 'function' && encoding === 'gzip') {
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
