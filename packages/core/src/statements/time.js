import { PassThrough } from 'stream';

/**
 * Measure the execution time of a script, on each chunk on input.
 *
 * @example <caption>Input</caption>
 * [1]
 *
 * @example <caption>Program</caption>
 * const script = `
 * [transit]
 * `;
 * from([1])
 *     .pipe(ezs('time', { script }))
 *
 * @example <caption>Output</caption>
 * [{
 *   data: 1,
 *   time: 15 // milliseconds
 * }]
 * @name time
 * @param {string}  [script]
 * @return {object}
 */
// eslint-disable-next-line consistent-return
export default function time(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        const file = this.getParam('file');
        const fileContent = ezs.loadScript(file);
        const script = this.getParam('script', fileContent);
        const cmds = ezs.compileScript(script);
        const commands = this.getParam('commands', cmds.get());
        const environment = this.getEnv();

        if (!commands || commands.length === 0) {
            return feed.stop(
                new Error('No script/commands/file to measure through time'),
            );
        }

        const streams = ezs.compileCommands(commands, environment);
        this.input = new PassThrough({ objectMode: true });

        const output = ezs.createPipeline(this.input, streams)
            .pipe(ezs.catch((e) => feed.write(e)))
            .on('error', (e) => feed.stop(e))
            .on('data', () => feed.write());

        this.whenFinish = new Promise((resolve) => {
            output.on('end', resolve);
        });
        this.startTime = Date.now();
        return ezs.writeTo(this.input, data, () => feed.end());
    }
    if (this.isLast()) {
        this.whenFinish
            .then(() => {
                feed.write({ time: Date.now() - this.startTime });
                feed.close();
            })
            .catch((e) => feed.stop(e));
        return this.input.end();
    }
    return ezs.writeTo(this.input, data, () => feed.end());
}
