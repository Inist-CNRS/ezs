import { Duplex, PassThrough } from 'stream';
import hasher from 'node-object-hash';
import { DEBUG } from './constants';

const hashCoerce = hasher({
    sort: false,
    coerce: true,
});

class Booster extends Duplex {
    constructor(ezs, commands, environment) {
        super(ezs.objectMode());
        this.ezs = ezs;
        this.commandsHash = hashCoerce.hash(commands);
        this.environmentHash = hashCoerce.hash(environment);
        this.pipeline = ezs.pipeline(commands, environment);
        this.firstWrite = true;
        this.readCalled = false;
        this.isCached = false;
        this.cacheHandle = null;
        this.uniqHash = null;
        this.cacheInput = new PassThrough(ezs.objectMode());
        this.cacheOutput = this.cacheInput
            .pipe(ezs('group'))
            .pipe(ezs('pack'))
            .pipe(ezs.compress(ezs.encodingMode()));
    }

    _write(chunk, encoding, callback) {
        const { ezs } = this;
        if (this.firstWrite) {
            this.firstWrite = false;
            let ignoreChunk = true;
            const firstChunkHash = hashCoerce.hash(chunk);
            const hashs = [this.commandsHash, this.environmentHash, firstChunkHash];
            DEBUG('Compute cache hash with', hashs.map(h => h.slice(0, 5).concat('...')));
            this.uniqHash = hashCoerce.hash(hashs);
            return ezs.getCache()
                .has(this.uniqHash)
                .then(cached => new Promise((resolve) => {
                    this.isCached = cached;
                    if (cached) {
                        DEBUG('Using cache with hash', this.uniqHash);
                        this.emit('cache:connected', this.uniqHash);
                        return ezs.getCache()
                            .get(this.uniqHash)
                            .catch(err => this.failWith(err))
                            .then(stream => resolve(stream));
                    }
                    DEBUG('Creating cache with hash', this.uniqHash);
                    this.emit('cache:created', this.uniqHash);
                    this.cacheHandle = ezs.getCache().set(this.uniqHash, this.cacheOutput);
                    return resolve();
                }))
                .then(stream => new Promise((resolve) => {
                    if (stream) {
                        const stream2 = stream.pipe(ezs.uncompress(ezs.encodingMode()));
                        stream2.on('error', err => this.failWith(err));

                        return resolve(stream2
                            .pipe(ezs('unpack'))
                            .pipe(ezs('ungroup'))
                            .pipe(ezs((data, feed) => {
                                if (data !== null) {
                                    if (!this.push(data)) {
                                        stream.pause();
                                    }
                                } else {
                                    this.push(null);
                                }
                                feed.send(data);
                            }))
                            .pipe(ezs.catch(err => this.failWith(err)))
                            //                            .pipe(ezs('transit'))
                            .on('error', err => this.failWith(err)));
                    }
                    ignoreChunk = false;
                    return resolve(this.pipeline
                        .pipe(ezs((data, feed) => {
                            if (data !== null) {
                                this.cacheInput.write(data, () => feed.send(data));
                            } else {
                                this.cacheInput.end(() => feed.send(data));
                            }
                        }))
                        .pipe(ezs((data, feed) => {
                            if (data !== null) {
                                if (!this.push(data)) {
                                    stream.pause();
                                }
                            } else {
                                this.push(null);
                            }
                            feed.send(data);
                        })));
                }))
                .then((output) => {
                    this.output = output;
                    if (!this.readCalled) {
                        this.output.pause();
                    }
                    if (!ignoreChunk) {
                        this.pipeline.write(chunk, encoding);
                    }
                    return callback();
                })
                .catch(err => this.failWith(err));
        }
        if (this.isCached) {
            return callback();
        }
        return this.pipeline.write(chunk, encoding, callback);
    }

    _read() {
        if (!this.readCalled) {
            this.readCalled = true;
        }
        if (this.output) {
            this.output.resume();
        }
    }

    _final(callback) {
        this.pipeline.end(() => {
            if (this.cacheHandle) {
                return this.cacheHandle
                    .catch(err => this.failWith(err))
                    .then(() => callback());
            }
            return callback();
        });
    }

    failWith(err) {
        // https://github.com/nodejs/node/issues/9242
        DEBUG(`Booster failed with ${err.message}`);
        this.emit('error', err);
        if (this.isCached) {
            this.ezs.getCache().del(this.uniqHash).catch(e => this.emit(e));
        }
    }
}

const booster = (ezs, commands, environment) => new Booster(ezs, commands, environment);

export default booster;
