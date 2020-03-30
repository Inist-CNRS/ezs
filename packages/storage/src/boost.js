import hasher from 'node-object-hash';
import DateDiff from 'date-diff';
import debug from 'debug';
import Store from './store';


const hashCoerce = hasher({
    sort: false,
    coerce: true,
});

function createURI(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const uri = 'uid:'.concat(this.getIndex().toString().padStart(10, '0'));
    return feed.send({
        value: [data],
        uri,
    });
}

const computeHash = (commands, environment, chunk) => {
    const commandsHash = hashCoerce.hash(commands);
    const environmentHash = hashCoerce.hash(environment);
    const firstChunkHash = hashCoerce.hash(chunk);
    const hashs = [commandsHash, environmentHash, firstChunkHash];
    debug('ezs')('Compute cache hash with', hashs.map((h) => h.slice(0, 5).concat('...')));
    return hashCoerce.hash(hashs);
};

function hitThe(cache, ttl) {
    if (!cache) {
        return false;
    }
    const diff = new DateDiff(Date.now(), cache.createdDate);
    const secs = diff.seconds();
    if (secs <= ttl) {
        return true;
    }
    debug('ezs')(`Cache has expired ${secs} secondes ago.`);
    return false;
}

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
export default async function boost(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        const file = this.getParam('file');
        const fileContent = ezs.loadScript(file);
        const script = this.getParam('script', fileContent);
        const cmds = ezs.compileScript(script);
        const commands = this.getParam('commands', cmds.get());
        const cleanupDelay = Number(this.getParam('cleanupDelay', 10 * 60));
        const environment = this.getEnv();
        if (!this.store) {
            this.store = new Store(this.ezs, 'cache_index');
        }
        if (!commands || commands.length === 0) {
            return feed.stop(new Error('Invalid parameter for booster'));
        }

        const streams = ezs.compileCommands(commands, environment);
        const uniqHash = String(this.getParam('key') || computeHash(commands, environment, data));
        const cache = await this.store.get(uniqHash);

        if (hitThe(cache, cleanupDelay)) {
            debug('ezs')('Boost using cache with hash', uniqHash);
            this.emit('cache:connected', uniqHash);
            const cacheGetInput = ezs.createStream(ezs.objectMode());

            cacheGetInput.pipe(ezs('storage:flow', { domain: uniqHash }))
                .pipe(ezs('extract', { path: 'value.0' }))
                .pipe(ezs.catch())
                .on('error', (e) => feed.stop(e))
                .on('data', (d) => feed.write(d))
                .on('end', () => {
                    debug('ezs')('Cache with hash', uniqHash, 'was readed');
                    feed.close();
                });
            cacheGetInput.end('GO');
            return true;
        }
        debug('ezs')('Boost creating cache with hash', uniqHash);
        this.emit('cache:created', uniqHash);
        this.cacheSetInput = ezs.createStream(ezs.objectMode());
        const cacheSetOutput = ezs.createPipeline(this.cacheSetInput, streams)
            .pipe(ezs.catch())
            .on('error', (e) => feed.write(e))
            .on('data', (d) => feed.write(d))
            .pipe(ezs(createURI))
            .pipe(ezs('storage:save', { domain: uniqHash, reset: true }))
            .pipe(ezs.catch());
        this.whenFinish = new Promise((cacheSaved, cacheCrashed) => {
            cacheSetOutput.on('error', (error) => {
                debug('ezs')('Error catched, no cache created with hash', uniqHash, error);
                cacheSaved();
            });
            cacheSetOutput.on('end', async () => {
                debug('ezs')('Registering cache with hash', uniqHash);
                try {
                    await this.store.put(uniqHash, { createdDate: Date.now() });
                } catch (error) {
                    cacheCrashed(error);
                }
                cacheSaved();
            });
        });
        debug('ezs')(
            `Boost first chunk #${this.getIndex()} containing ${Object.keys(data).length || 0} keys`,
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
                    debug('ezs')(`${this.getIndex()} chunks have been boosted`);
                    this.whenFinish
                        .then(() => {
                            feed.close();
                        })
                        .catch((e) => feed.stop(e));
                    this.cacheSetInput.end();
                    return true;
                }
                return ezs.writeTo(this.cacheSetInput, data, () => feed.end());
            })
            .catch((e) => feed.stop(e));
    }
    return true;
}
