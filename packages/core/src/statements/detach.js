import debug from 'debug';
import path from 'path';
import { Worker } from 'worker_threads';
import filedirname from 'filedirname';
import net from 'net';
import JSONezs from '../json.js';

const [, dirname] = filedirname();

function pipeToWorker(readable, port) {
    readable.on('data', (chunk) => port.postMessage({ type: 'data', chunk }));
    readable.on('end', ()        => port.postMessage({ type: 'end' }));
    readable.on('error', (err)   => port.postMessage({ type: 'error', message: err.message }));
}

// The execution program used by the thread ( worker) uses the runtime specified in the package.json file, so it will switch to esm mode.
// Therefore, if ezs is executed in CJS, the file used will be the one in the lib path, i.e., in CJS, and it will be incompatible.
// There are two possible options:
// - always use the esm file
// - use a file with the cjs extension to force the use of commonjs.
// To avoid confusion, the file is moved to the bin directory.

const workerFile = path.resolve(dirname, '../../bin/detach-worker.js');

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
    if (!this.input) {
        this.input = ezs.createStream(ezs.objectMode());
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
        const toWorker = this.input.pipe(ezs.createCommand(workerData.encoder));
        const fromWorker = ezs.createCommand(workerData.decoder);
        this.worker = new Worker(workerFile, {
            workerData,
        });
        this.worker.on('exit', (code) => {
            if (code !== 0) feed.stop(new Error(`Worker stopped with exit code ${code}`));
        });
        this.whenFinish = new Promise((resolve, reject) => {
            this.worker.on('message', ({ stdinPort, stdoutPort }) => {
                const stdinSocket = net.connect(stdinPort, '127.0.0.1', () => {
                    toWorker.pipe(stdinSocket);
                });

                const stdoutSocket = net.connect(stdoutPort, '127.0.0.1', () => {
                    const output = stdoutSocket.pipe(fromWorker);
                    resolve(feed.flow(output, { autoclose: true, emptyclose: false }));
                });

                this.worker.on('exit', () => {
                    stdinSocket.destroy();
                    stdoutSocket.destroy();
                    reject();
                });
            });

            this.whenReady = new Promise((resolve, reject) => {
                this.worker.once('online', resolve);
                this.worker.once('error', (err) => {
                    debug('ezs:error')('Worker crash', this.ezs.serializeError(err));
                    // exit event will stop the feed;
                    reject(err);
                });
            });
        });

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
