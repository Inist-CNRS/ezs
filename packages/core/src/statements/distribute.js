import debug from 'debug';
import path from 'path';
import { Worker } from 'worker_threads';
import filedirname from 'filedirname';

const [, dirname] = filedirname();
/**
 * Delegate processing to an external pipeline.
 *
 * > **Note**: works like {@link spawn}, but each chunk share the same external pipeline.
 *
 * @name delegate
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @param {String} [logger] A dedicaded pipeline described in a file to trap or log errors
 * @returns {Object}
 */
export default function distribute(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        this.input = ezs.createStream(ezs.objectMode());


        const workerFile = path.resolve(dirname, './distribute-worker.js');
        const workerData = {
            file: this.getParam('file'),
            script: this.getParam('script'),
            command: this.getParam('command'),
            commands: this.getParam('commands'),
            prepend: this.getParam('prepend', 'debug'),
            append: this.getParam('append', 'debug'),
            environment: this.getEnv(),
            loggerParam: this.getParam('logger'),
            settings: ezs.settings,
        };
        this.worker = new Worker(workerFile, {
            workerData,
            stdin: true,
            stdout: true,
        });
        this.worker.on('exit', (code) => {
            if (code !== 0) feed.stop(new Error(`Worker stopped with exit code ${code}`));
        });
        this.whenReady =  new Promise((resolve, reject) => {
            this.worker.once('online', resolve);
            this.worker.once('error', (err) => {
                debug('ezs:error')('Worker crash', this.ezs.serializeError(err));
                // exit event will stop the feed;
                reject(err);
            });
        });
        this.input
            .pipe(ezs('group'))
            .pipe(ezs('pack'))
            .pipe(ezs.compress())
            .pipe(ezs('debug', {text: 'after group/pack main'}))
            .pipe(this.worker.stdin);
        const output = this.worker.stdout
            .pipe(ezs.uncompress())
            .pipe(ezs('unpack'))
            .pipe(ezs('ungroup'))
            .pipe(ezs('debug', {text: 'after unpack/ungroup main'}));
        this.whenFinish = feed.flow(output, { autoclose: true });
    }
    if (this.isLast()) {
        debug('ezs:debug')(`${this.getIndex()} chunks have been delegated`);
        this.whenFinish.finally(() => {
            feed.close();
            return this.worker.terminate();
        });
        return this.input.end();
    }
    this.whenReady.then(() => {
        debug('ezs:debug')(`to worker ${data}`);
        return ezs.writeTo(this.input, data, () => feed.end());
    });
}
