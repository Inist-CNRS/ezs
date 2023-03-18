import debug from 'debug';
import _ from 'lodash';

/**
 * fork the current pipeline
 *
 * > **Note**: but each chunk is sent to the same external pipeline.
 *
 * @name fork
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @returns {Object}
 */
export default function fork(data, feed) {
    const { ezs } = this;
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
            output = ezs.createPipeline(this.input, statements);
        }
        catch(e) {
            return feed.stop(e);
        }
        output.pipe(ezs.catch((e) => feed.write(e))); // avoid to break pipeline at each error
        output.on('data', () => true);
        output.once('error', (e) => feed.stop(e));
        this.whenFinish = new Promise((resolve) => output.once('end', resolve));
    }
    if (this.isLast()) {
        debug('ezs')(`${this.getIndex()} chunks have been delegated`);
        this.whenFinish.finally(() => feed.close());
        return this.input.end();
    }
    return ezs.writeTo(this.input, _.clone(data), () => feed.send(data));
}
