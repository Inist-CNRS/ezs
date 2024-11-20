import debug from 'debug';
import { addedDiff } from 'deep-object-diff';

/**
 * Takes only the first  `Object` delegate processing to a external pipeline
 *
 * @name singleton
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @param {String} [logger] A dedicaded pipeline described in a file to trap or log errors
 * @returns {Object}
 */
export default function singleton(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (this.isFirst()) {
        const { ezs } = this;
        debug('ezs:debug')('[singleton] starting once with one object.');
        const savedData = { ...data };
        let result = {};
        const input = ezs.createStream(ezs.objectMode());
        const commands = ezs.createCommands({
            file: this.getParam('file'),
            script: this.getParam('script'),
            command: this.getParam('command'),
            commands: this.getParam('commands'),
            prepend: this.getParam('prepend'),
            append: this.getParam('append'),
        });
        const statements = ezs.compileCommands(commands, this.getEnv());
        const logger = ezs.createTrap(this.getParam('logger'), this.getEnv());
        ezs.createPipeline(input, statements, logger)
            .pipe(ezs.catch())
            .on('error', (e) => feed.stop(e))
            .on('data', (chunk) => {
                result = Object.assign(result, chunk);
            })
            .on('end', () => {
                this.addedResult = addedDiff(savedData, result);
                feed.send(Object.assign(data, this.addedResult));
            });
        input.write(data);
        return input.end();
    }
    return feed.send(Object.assign(data, this.addedResult));
}
