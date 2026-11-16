import debug from 'debug';
import { duplexer } from './parallel.js';
import { index } from 'cacache';
/**
 * Delegate each value form array input to an external pipeline, throw each chunk from the result.
 *
 * > **Note**: works like {@link delegate}, but each chunk use its own external pipeline
 *
 * @name reduce
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in an object
 * @param {String} [command] the external pipeline is described in an URL-like command
 * @param {String} [logger] A dedicaded pipeline described in a file to trap or log errors
 * @returns {Object}
 */
export default async function reduce(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { ezs } = this;
    const commands = ezs.createCommands({
        file: this.getParam('file'),
        script: this.getParam('script'),
        command: this.getParam('command'),
        commands: this.getParam('commands'),
        prepend: this.getParam('prepend'),
        append: this.getParam('append'),
    });
    const environment = this.getEnv();
    const dataArray = [].concat(data);
    const concurrency = dataArray.length;
    debug('ezs:debug')(`[reduce] start with #${concurrency} workers.`);
    const logger = ezs.createTrap(this.getParam('logger'), this.getEnv());
    const funnel = ezs.createStream(ezs.objectMode());
    const handles = Array(concurrency)
        .fill(true)
        .map(duplexer(ezs, commands, environment, logger, funnel));
    dataArray.map((itemValue, itemIndex) => {
        ezs.writeTo(handles[itemIndex][0], itemValue, () =>
            handles[itemIndex][0].end()
        );
    });
    Promise.all(handles.map((h) => h[1])).finally(() => {
        funnel.end();
    });
    feed.flow(funnel);
}
