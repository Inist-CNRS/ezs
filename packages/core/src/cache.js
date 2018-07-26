import fs from 'fs';
import tmpFilepath from 'tmp-filepath';
import LRU from 'lru-cache';
import { PassThrough } from 'stream';
import { compressStream, decompressStream } from 'node-zstd';

const deleteFile = (key, fileName) => {
    fs.unlink(fileName, err => {
        if (err) throw err;
    });
};

export default class Cache {
    constructor(ezs, opts) {
        const options = opts || {}
        const cacheOptions = {
            max: 500,
            maxAge: 1000 * 60 * 60,
            ...options,
        };
        cacheOptions.dispose = deleteFile;
        this.handle = LRU(cacheOptions);
        this.ezs = ezs;
        this.objectMode = options.objectMode || false;
    }

    get(key) {
        const ezs = this.ezs;
        const cache = this.handle;
        const cacheFile = cache.get(key);
        if (cacheFile) {
            const rawStream = fs.createReadStream(cacheFile)
                .pipe(decompressStream())
            ;
            return this.objectMode ? rawStream.pipe(ezs('ndjson')) : rawStream;
        }
        return;
    }

    set(key) {
        const ezs = this.ezs;
        const cache = this.handle;
        const tmpFile = tmpFilepath('.bin');
        const streamOptions = this.objectMode ? ezs.objectMode() : ezs.bytesMode();
        const cacheInput = new PassThrough(streamOptions);
        if (this.objectMode) {
            cacheInput
                .pipe(ezs('jsonnd'))
                .pipe(ezs.toBuffer())
                .pipe(compressStream())
                .pipe(fs.createWriteStream(tmpFile));
        } else {
            cacheInput
                .pipe(compressStream())
                .pipe(fs.createWriteStream(tmpFile));
        }
        const func = (data, feed) => {
            if (data) {
                cacheInput.write(data);
            } else {
                cacheInput.end();
                cache.set(key, tmpFile);
            }
            feed.send(data);
        };
        const stream = new PassThrough(streamOptions);
        return stream.pipe(ezs(func));
    }

}
