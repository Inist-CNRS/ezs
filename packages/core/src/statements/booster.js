import { PassThrough } from 'stream';
import hasher from 'node-object-hash';
import File from '../file';
import Commands from '../commands';
import { DEBUG } from '../constants';
import {
    writeTo,
} from '../client';

const hashCoerce = hasher({
    sort: false,
    coerce: true,
});

const computeHash = (commands, environment, chunk) => {
    const commandsHash = hashCoerce.hash(commands);
    const environmentHash = hashCoerce.hash(environment);
    const firstChunkHash = hashCoerce.hash(chunk);
    const hashs = [commandsHash, environmentHash, firstChunkHash];
    DEBUG('Compute cache hash with', hashs.map(h => h.slice(0, 5).concat('...')));
    return hashCoerce.hash(hashs);
};

/**
 * Takes an `Object` delegate processing to an external pipeline
 *
 * @param {String} [file] the external pipeline is descrbied in a file
 * @param {String} [script] the external pipeline is descrbied in a sting of characters
 * @param {String} [commands] the external pipeline is descrbied in object
 * @returns {Object}
 */
export default function booster(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        const file = this.getParam('file');
        const script = this.getParam('script', File(ezs, file));
        const cmds = new Commands(ezs.parseString(script));
        const commands = this.getParam('commands', cmds.get());
        const environment = this.getEnv();

        if (!commands || commands.length === 0) {
            return feed.stop(new Error('Invalid parmeter for delegate'));
        }

        const streams = ezs.compileCommands(commands, environment);
        this.input = new PassThrough({ objectMode: true });

        this.whenReady = new Promise((getup) => {
            const uniqHash = computeHash(commands, environment, data);
            ezs.getCache()
                .has(uniqHash)
                .then(cached => new Promise((resolve) => {
                    this.cached = cached;
                    if (cached) {
                        DEBUG('Using cache with hash', uniqHash);
                        this.emit('cache:connected', uniqHash);
                        return ezs.getCache()
                            .get(uniqHash)
                            .catch(err => feed.stop(err))
                            .then((stream) => {
                                stream
                                    .pipe(ezs.uncompress(ezs.encodingMode()))
                                    .on('error', (e1) => {
                                        DEBUG('Error while reading cache with hash', uniqHash, e1);
                                        ezs.getCache().del(uniqHash).catch((e2) => {
                                            DEBUG('Error while deleting cache with hash', uniqHash, e2);
                                        });
                                        feed.stop();
                                    })
                                    .pipe(ezs('unpack'))
                                    .pipe(ezs('ungroup'))
                                    .pipe(ezs.catch(e => e))
                                    .on('error', e => feed.stop(e))
                                    .on('data', d => feed.write(d))
                                    .on('end', () => {
                                        DEBUG('Cache with hash', uniqHash, 'was readed');
                                        feed.close();
                                    });
                            });
                    }
                    DEBUG('Creating cache with hash', uniqHash);
                    this.emit('cache:created', uniqHash);
                    this.input = new PassThrough(ezs.objectMode());
                    const output = ezs.createPipeline(this.input, streams)
                        .pipe(ezs.catch(e => e))
                        .on('error', e => feed.write(e))
                        .on('data', d => feed.write(d))
                        .pipe(ezs('group'))
                        .pipe(ezs('pack'))
                        .pipe(ezs.compress(ezs.encodingMode()));

                    this.whenFinish = new Promise((done) => {
                        DEBUG('Cache with hash', uniqHash, 'was writed');
                        output.on('end', done);
                    });

                    ezs.getCache()
                        .set(uniqHash, output)
                        .then(() => {
                            DEBUG('Cache has created with hash', uniqHash);
                        })
                        .catch((e1) => {
                            DEBUG('Error while creating cache with hash', uniqHash, e1);
                            ezs.getCache().del(uniqHash).catch((e2) => {
                                DEBUG('Error while deleting cache with hash', uniqHash, e2);
                            });
                        });
                    DEBUG(`Delegate first chunk #${this.getIndex()} containing ${Object.keys(data).length || 0} keys`);
                    return writeTo(this.input, data, () => {
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
            if (this.whenFinish) {
                if (this.isLast()) {
                    this.whenFinish
                        .then(() => feed.close())
                        .catch(e => feed.stop(e));
                    return this.input.end();
                }
                DEBUG(`Delegate chunk #${this.getIndex()} containing ${Object.keys(data).length || 0} keys`);
                return writeTo(this.input, data, () => feed.end());
            }
            return 1;
        })
        .catch(e => feed.stop(e));
}
