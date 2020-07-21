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
