import debug from 'debug';
import _ from 'lodash';

/**
 * fork the current pipeline
 *
 * > **Note**: but each chunk is sent to the same external pipeline.
 *
 * @name fork
 * @param {Boolean} [standalone=false] The current pipeline will be able to end without waiting for the end of the external pipeline
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @param {String} [logger] A dedicaded pipeline described in a file to trap or log errors
 * @returns {Object}
 */
export default function fork(data, feed) {
    const { ezs } = this;
    const standalone = Number([]
        .concat(this.getParam('standalone', false))
        .filter(Boolean)
        .shift());

    if (this.isFirst()) {
        let output;
        try {
            this.input = ezs.createStream(ezs.objectMode());
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
            output = ezs.createPipeline(this.input, statements, logger);
        }
        catch(e) {
            return feed.stop(e);
        }
        if (standalone) {
            output
                .on('data', () => true)
                .once('end', () => true);
        } else {
            this.whenFinish = new Promise((resolve) => output
                .pipe(ezs.catch((e) => feed.write(e))) // avoid to break pipeline at each error
                .once('error', (e) => feed.stop(e))
                .once('end', resolve)
                .on('data', () => true)
            );
        }
    }
    if (this.isLast()) {
        debug('ezs')(`${this.getIndex()} chunks have been delegated`);
        this.input.end();
        if (standalone) {
            feed.close();
        } else {
            this.whenFinish.finally(() => feed.close());
        }
        return true;
    }
    return ezs.writeTo(this.input, _.clone(data), () => feed.send(data));
}
