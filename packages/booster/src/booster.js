import { PassThrough } from 'stream';
import hasher from 'node-object-hash';
import debug from 'debug';
import Cache from './cache';

const hashCoerce = hasher({
    sort: false,
    coerce: true,
});

let cacheHandle;

const computeHash = (commands, environment, chunk) => {
    const commandsHash = hashCoerce.hash(commands);
    const environmentHash = hashCoerce.hash(environment);
    const firstChunkHash = hashCoerce.hash(chunk);
    const hashs = [commandsHash, environmentHash, firstChunkHash];
    debug('ezs')('Compute cache hash with', hashs.map(h => h.slice(0, 5).concat('...')));
    return hashCoerce.hash(hashs);
};

/**
 * Takes an `Object` delegate processing to an external pipeline and cache the result
 *
 * @param {String} [file] the external pipeline is descrbied in a file
 * @param {String} [script] the external pipeline is descrbied in a sting of characters
 * @param {String} [commands] the external pipeline is descrbied in object
 * @param {String} [key] the cache key identifier form the stream, in not provided, the key is computed with the first chunk
 * @param {Number} [hitsByCheck=1000] Number of hits to verify the cache
 * @param {Number} [maxFiles=100] Number of hits to verify the cache
 * @param {Number} [maxTotalSize=1000000000] Size (bytes) maximun of the cash (1 G)
 * @param {Number} [cleanupDelay=600000] Frequency (milliseconds) to cleanup the cahe (10 min)
 * @returns {Object}
 */
export default function booster(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        const file = this.getParam('file');
        const fileContent = ezs.loadScript(file);
        const script = this.getParam('script', fileContent);
        const cmds = ezs.compileScript(script);
        const commands = this.getParam('commands', cmds.get());
        const key = this.getParam('key');
        const hitsByCheck = Number(this.getParam('hitsByCheck', 1000));
        const maxTotalSize = Number(this.getParam('maxTotalSize'));
        const maxFiles = Number(this.getParam('maxFiles', 100));
        const cleanupDelay = Number(this.getParam('cleanupDelay', 10 * 60 * 1000));
        const rootPath = this.getParam('rootPath');
        const directoryPath = this.getParam('directoryPath');
        const environment = this.getEnv();

        if (!cacheHandle) {
            cacheHandle = new Cache({
                maxTotalSize,
                cleanupDelay,
                maxFiles,
                directoryPath,
                rootPath,
                hitsByCheck,
            });
        }

        if (!commands || commands.length === 0) {
            return feed.stop(new Error('Invalid parameter for booster'));
        }

        const streams = ezs.compileCommands(commands, environment);
        this.input = new PassThrough({ objectMode: true });

        this.whenReady = new Promise((getup) => {
            const uniqHash = key || computeHash(commands, environment, data);
            const resetCacheOnError = (error, action) => {
                debug('ezs')(`Error while ${action} cache with hash`, uniqHash, error);
                cacheHandle.del(uniqHash).catch((error1) => {
                    debug('ezs')('Error while deleting cache with hash', uniqHash, error1);
                });
            };

            cacheHandle.has(uniqHash)
                .then(cached => new Promise((resolve) => {
                    this.cached = cached;
                    if (cached) {
                        debug('ezs')('Using cache with hash', uniqHash);
                        this.emit('cache:connected', uniqHash);
                        return cacheHandle
                            .get(uniqHash)
                            .catch(err => feed.stop(err))
                            .then((stream) => {
                                stream
                                    .pipe(ezs.uncompress(ezs.encodingMode()))
                                    .on('error', (e1) => {
                                        resetCacheOnError(e1, 'reading');
                                        feed.stop();
                                    })
                                    .pipe(ezs('unpack'))
                                    .pipe(ezs('ungroup'))
                                    .pipe(ezs.catch(e => e))
                                    .on('error', e => feed.stop(e))
                                    .on('data', d => feed.write(d))
                                    .on('end', () => {
                                        debug('ezs')('Cache with hash', uniqHash, 'was readed');
                                        feed.close();
                                    });
                            });
                    }
                    debug('ezs')('Creating cache with hash', uniqHash);
                    this.emit('cache:created', uniqHash);
                    this.input = new PassThrough(ezs.objectMode());
                    const output = ezs.createPipeline(this.input, streams)
                        .pipe(ezs.catch(e => e))
                        .on('error', e => feed.write(e))
                        .on('data', d => feed.write(d))
                        .pipe(ezs('group'))
                        .pipe(ezs('pack'))
                        .pipe(ezs.catch(e => e))
                        .on('error', e => resetCacheOnError(e, 'before saving'))
                        .pipe(ezs.compress(ezs.encodingMode()))
                        .on('error', e => resetCacheOnError(e, 'after saving'));

                    this.whenFinish = new Promise((done) => {
                        cacheHandle
                            .set(uniqHash, output)
                            .then(() => {
                                debug('ezs')('Cache has created with hash', uniqHash);
                                return cacheHandle.check();
                            })
                            .then(done)
                            .catch((e) => {
                                resetCacheOnError(e, 'creating');
                                feed.stop();
                            });
                    });
                    debug('ezs')(`Booster first chunk #${this.getIndex()} containing ${Object.keys(data).length || 0} keys`);
                    return ezs.writeTo(this.input, data, () => {
                        feed.end();
                        getup();
                        return resolve();
                    });
                }));
        });
        return 1;
    }
    return this.whenReady
        .then(() => {
            if (this.isLast()) {
                this.whenFinish
                    .then(() => feed.close())
                    .catch(e => feed.stop(e));
                return this.input.end();
            }
            debug('ezs')(`Booster chunk #${this.getIndex()} containing ${Object.keys(data).length || 0} keys`);
            return ezs.writeTo(this.input, data, () => feed.end());
        })
        .catch(e => feed.stop(e));
}
