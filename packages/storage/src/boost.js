import hasher from 'node-object-hash';
import DateDiff from 'date-diff';
import debug from 'debug';
import {
    decodeValue, encodeKey, encodeValue, lmdbEnv,
} from './store';


const hashCoerce = hasher({
    sort: false,
    coerce: true,
});

        debug.enable('ezs');
const computeHash = (commands, environment, chunk) => {
    const commandsHash = hashCoerce.hash(commands);
    const environmentHash = hashCoerce.hash(environment);
    const firstChunkHash = hashCoerce.hash(chunk);
    const hashs = [commandsHash, environmentHash, firstChunkHash];
    debug('ezs')('Compute cache hash with', hashs.map((h) => h.slice(0, 5).concat('...')));
    return hashCoerce.hash(hashs);
};

const hitThe = (cache, ttl) => {
    if (!cache) {
        return false;
    }
    const diff = new DateDiff(Date.now(), cache.createdDate);
    if (diff.seconds() <= ttl) {
        return true;
    }
    return false;
};

/**
 * Takes an `Object` delegate processing to an external pipeline and cache the result
 *
 * @param {String} [file] the external pipeline is descrbied in a file
 * @param {String} [script] the external pipeline is descrbied in a sting of characters
 * @param {String} [commands] the external pipeline is descrbied in object
 * @param {String} [key] the cache key form the stream, in not provided, it's computed with the first chunk
 * @param {Number} [cleanupDelay=600] Frequency (seconds) to cleanup the cache (10 min)
 * @returns {Object}
 */
export default function boost(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        const file = this.getParam('file');
        const fileContent = ezs.loadScript(file);
        const script = this.getParam('script', fileContent);
        const cmds = ezs.compileScript(script);
        const commands = this.getParam('commands', cmds.get());
        const key = this.getParam('key');
        const cleanupDelay = Number(this.getParam('cleanupDelay', 10 * 60));
        const environment = this.getEnv();
        if (!this.dbi) {
            this.dbi = lmdbEnv(this.ezs).openDbi({
                name: 'cache_index',
                create: true,
            });
        }

        if (!commands || commands.length === 0) {
            return feed.stop(new Error('Invalid parameter for booster'));
        }

        const streams = ezs.compileCommands(commands, environment);
        const uniqHash = key || computeHash(commands, environment, data);
        const resetCacheOnError = (error, action) => {
            debug('ezs')(`Error while ${action} cache with hash`, uniqHash, error);
            const txn3 = lmdbEnv().beginTxn();
            txn3.putString(this.dbi, encodeKey(uniqHash), encodeValue(Date.now()));
            txn3.commit();
            debug('ezs')('Error while deleting cache with hash', uniqHash, error);
        };
        const txn = lmdbEnv().beginTxn({ readOnly: true });
        const cache = decodeValue(txn.getString(this.dbi, uniqHash));
        txn.commit();

        if (hitThe(cache, cleanupDelay)) {
            debug('ezs')('Using cache with hash', uniqHash);
            this.emit('cache:connected', uniqHash);
            const cacheGetInput = ezs.createStream(ezs.objectMode());

            cacheGetInput.pipe(ezs('storage:flow', { domain: uniqHash }))
                .pipe(ezs('extract', { path: 'value.0' }))
                .pipe(ezs.catch((e) => e))
                .on('error', (e) => feed.stop(e))
                .on('data', (d) => feed.write(d))
                .on('end', () => {
                    debug('ezs')('Cache with hash', uniqHash, 'was readed');
                    feed.close();
                });
            cacheGetInput.end('GO');
            return true;
        }
        debug('ezs')('Creating cache with hash', uniqHash);
        this.emit('cache:created', uniqHash);
        this.cacheSetInput = ezs.createStream(ezs.objectMode());
        const cacheSetOutput = ezs.createPipeline(this.cacheSetInput, streams)
            .pipe(ezs.catch((e) => e))
            .on('error', (e) => feed.write(e))
            .on('data', (d) => feed.write(d))
            .pipe(ezs((da, fe) => (da === null ? fe.close() : fe.send({ value: [da] }))))
            .pipe(ezs('storage:identify'))
            .pipe(ezs('storage:save', { domain: uniqHash, reset: true }))
            .pipe(ezs.catch((e) => e))
            .on('error', (e) => resetCacheOnError(e, 'after saving'));
        this.whenFinish = new Promise((cacheSaved) => {
            cacheSetOutput.on('end', () => {
                debug('ezs')('Registering cache with hash', uniqHash);
                const txn2 = lmdbEnv().beginTxn();
                txn2.putString(this.dbi, encodeKey(uniqHash), encodeValue({ createdDate: Date.now() }));
                txn2.commit();
                cacheSaved();
            });
        });
        debug('ezs')(
            `Booster first chunk #${this.getIndex()} containing ${Object.keys(data).length || 0} keys`,
        );
        this.whenReady = new Promise((cacheCreated) => ezs.writeTo(this.cacheSetInput, data, () => {
            cacheSetOutput.resume(); // empty the pipeline because no processing reads the data it contains.
            feed.end();
            cacheCreated();
        }));
    } else {
        this.whenReady
            .then(() => {
                if (this.isLast()) {
                    this.whenFinish
                        .then(() => {
                            this.dbi.close();
                            feed.close();
                        })
                        .catch((e) => feed.stop(e));
                    this.cacheSetInput.end();
                    return true;
                }
                debug('ezs')(`Booster chunk #${this.getIndex()} containing ${Object.keys(data).length || 0} keys`);
                return ezs.writeTo(this.cacheSetInput, data, () => feed.end());
            });
    }
    return true;
}
