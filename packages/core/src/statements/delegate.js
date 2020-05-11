import { PassThrough } from 'stream';
import debug from 'debug';

/**
 * Takes an `Object` delegate processing to an external pipeline
 *
 * @name delegate
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @returns {Object}
 */
export default function delegate(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        const file = this.getParam('file');
        const fileContent = ezs.loadScript(file);
        const script = this.getParam('script', fileContent);
        const cmd1 = ezs.compileScript(script).get();
        const command = this.getParam('command');
        const cmd2 = [].concat(command).map(ezs.parseCommand).filter(Boolean);
        const commands = this.getParam('commands', cmd1.concat(cmd2));
        const environment = this.getEnv();
        if (!commands || commands.length === 0) {
            return feed.stop(new Error('Invalid parmeter for [delegate]'));
        }
        debug('ezs')('[delegate] to sub pipeline.');
        const streams = ezs.compileCommands(commands, environment);
        this.input = ezs.createStream(ezs.objectMode());
        const output = ezs.createPipeline(this.input, streams)
            .pipe(ezs.catch((e) => feed.write(e)))
            .on('error', (e) => feed.write(e))
            .on('data', (d) => feed.write(d));
        this.whenFinish = new Promise((resolve) => {
            output.on('end', resolve);
        });
    }
    if (this.isLast()) {
        debug('ezs')(`${this.getIndex()} chunks have been delegated`);
        this.whenFinish
            .then(() => feed.close())
            .catch((e) => feed.stop(e));
        return this.input.end();
    }
    return ezs.writeTo(this.input, data, () => feed.end());
}
