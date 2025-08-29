import debug from 'debug';
import settings from '../settings.js';

const unused = 'UNUSED';

export const duplexer = (ezs, commands, environment, logger, funnel) => () => {
    const input = ezs.createStream(ezs.objectMode());
    const streams = ezs.compileCommands(commands, environment);
    const output = new Promise((resolve) => ezs.createPipeline(input, streams, logger)
        .pipe(ezs((data, feed, ctx) => {
            if (ctx.isLast()) {
                feed.close();
                resolve(true);
                return;
            }
            return ezs.writeTo(funnel, data, () => {
                feed.end();
            });
        }))
        .pipe(ezs.catch())
        .on('error', (e) => {
            if (e instanceof Error && e.message !== unused) {
                funnel.write(e)
            }
            resolve(true);
        }));
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
        const funnel = ezs.createStream(ezs.objectMode());
        const handles = Array(concurrency).fill(true).map(duplexer(ezs, commands, environment, logger, funnel));
        this.ins = handles.map((h) => h[0]);
        this.use = Array(concurrency).fill(false);
        Promise.all(handles.map((h) => h[1])).finally(() => {
            funnel.end();
        });
        this.whenFinish = feed.flow(funnel);
    }
    if (this.isLast()) {
        this.whenFinish.finally(() => {
            feed.close()
        });
        this.ins.forEach((handle, index) => {
            if (!this.use[index]) {
                handle.end(new Error(unused));
            } else {
                handle.end();
            }
        });
    } else {
        if (this.lastIndex >= this.ins.length) {
            this.lastIndex = 0;
        }
        this.use[this.lastIndex] = true;
        const check = ezs.writeTo(this.ins[this.lastIndex], data, () => feed.end());
        if (!check) {
            this.lastIndex += 1;
        }
    }
    return 1;
}
