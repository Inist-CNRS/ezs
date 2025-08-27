import debug from 'debug';
import path from 'path';
import { Worker } from 'worker_threads';
import filedirname from 'filedirname';
import JSONezs from '../json.js';

const [, dirname] = filedirname();
/**
 * Delegate processing to an external pipeline.
 *
 * > **Note**: works like {@link spawn}, but each chunk share the same external pipeline.
 *
 * @name detach
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @param {String} [logger] A dedicaded pipeline described in a file to trap or log errors
 * @param {String} [encoder=pack] The statement to encode each chunk to a string
 * @param {String} [decoder=unpack] The statement to decode each chunk as a string
 * @returns {Object}
 */
export default function detach(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        this.input = ezs.createStream(ezs.objectMode());
        ;
        const workerFile = path.resolve(dirname, './detach-worker.js');
        const workerData = {
            file: this.getParam('file'),
            script: this.getParam('script'),
            commandString: JSONezs.stringify(this.getParam('command')),
            commandsString: JSONezs.stringify(this.getParam('commands')),
            prepend: this.getParam('prepend'),
            append: this.getParam('append'),
            encoder: this.getParam('encoder', 'pack'),
            decoder: this.getParam('decoder', 'unpack'),
            environment: this.getEnv(),
            loggerParam: this.getParam('logger'),
            settings: ezs.settings,
            plugins: ezs.useFiles(),
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
            .pipe(ezs.createCommand(workerData.encoder))
            .pipe(this.worker.stdin);
        const output = this.worker.stdout
            .pipe(ezs.createCommand(workerData.decoder));
        this.whenFinish = feed.flow(output, { autoclose: true, emptyclose: false });
    }
    if (this.isLast()) {
        debug('ezs:debug')(`${this.getIndex()} chunks have been detached`);
        this.whenFinish.finally(() => {
            feed.close();
            return this.worker.terminate();
        });
        return this.input.end();
    }
    this.whenReady.then(() => ezs.writeTo(this.input, data, () => feed.end()));
}
