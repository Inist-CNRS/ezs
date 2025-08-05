import { PassThrough } from 'readable-stream';
import module from 'module';
import debug from 'debug';
import filedirname from 'filedirname';

const [currentFilename] = filedirname();

const req = module.createRequire(currentFilename);

const resolve = (name) => {
    try {
        req.resolve(name);
        return true;
    } catch (e) {
        return false;
    }
};

const chooseZ = () => {
    if (resolve('zlib')) {
        return req('zlib');
    }
    return null;
};

const z = chooseZ();

export function compressStream(ezs, opts = {}) {
    const encoding = opts['Content-Encoding'] || opts['content-encoding'] || 'identity';
    if (typeof z.createGunzip === 'function' && encoding === 'gzip') {
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
