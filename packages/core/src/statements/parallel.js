import merge from 'merge2';
import debug from 'debug';
import settings from '../settings';

export const duplexer = (ezs, commands, environment, logger) => () => {
    const input = ezs.createStream(ezs.objectMode());
    const streams = ezs.compileCommands(commands, environment);
    const output = ezs.createPipeline(input, streams, logger);
    const duplex = [input, output];
    return duplex;
};
/**
 * Takes an `Object` delegate processing to X internal pipelines
 *
 * @name parallel
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @param {String} [logger] A dedicaded pipeline described in a file to trap or log errors
 * @returns {Object}
 */
export default function parallel(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        this.lastIndex = 0;
        const file = this.getParam('file');
        const fileContent = ezs.loadScript(file);
        const script = this.getParam('script', fileContent);
        const cmd1 = ezs.compileScript(script).get();
        const command = this.getParam('command');
        const cmd2 = [].concat(command).map(ezs.parseCommand).filter(Boolean);
        const commands = this.getParam('commands', cmd1.concat(cmd2));
        const concurrency = Number(this.getParam('concurrency', settings.concurrency));
        const environment = this.getEnv();
        if (!commands || commands.length === 0) {
            return feed.stop(new Error('Invalid parmeter for [parallel]'));
        }
        debug('ezs:debug')(`[parallel] start with #${concurrency} workers.`);
        const logger = ezs.createTrap(this.getParam('logger'), this.getEnv());
        const handles = Array(concurrency).fill(true).map(duplexer(ezs, commands, environment, logger));
        this.ins = handles.map((h) => h[0]);
        this.outs = handles.map((h) => h[1]);
        const funnel = merge(this.outs, ezs.objectMode())
            .on('queueDrain', () => {
                funnel.destroy();
            })
            .on('error', (e) => feed.write(e))
            .on('data', (d) => feed.write(d));
        this.whenFinish = new Promise((resolve) => {
            funnel.on('close', resolve);
        });
    }
    if (this.isLast()) {
        this.whenFinish.then(() => feed.close()); // reject is never called
        this.ins.forEach((handle) => handle.end());
    } else {
        if (this.lastIndex >= this.ins.length) {
            this.lastIndex = 0;
        }
        const check = ezs.writeTo(this.ins[this.lastIndex], data, () => feed.end());
        if (!check) {
            this.lastIndex += 1;
        }
    }
    return 1;
}
