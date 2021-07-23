import debug from 'debug';

/**
 * Delegate processing to an external pipeline.
 *
 * > **Note**: works like {@link spawn}, but each chunk share the same external pipeline.
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
        const output = ezs.createPipeline(this.input, statements)
            .pipe(ezs.catch((e) => feed.write(e))); // avoid to break pipeline at each error
        this.whenFinish = feed.flow(output);
    }
    if (this.isLast()) {
        debug('ezs')(`${this.getIndex()} chunks have been delegated`);
        this.whenFinish.finally(() => feed.close());
        return this.input.end();
    }
    return ezs.writeTo(this.input, data, () => feed.end());
}
