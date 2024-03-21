/**
 * Delegate processing to an external pipeline, throw each chunk from the result.
 *
 * > **Note**: works like {@link delegate}, but each chunk use its own external pipeline
 *
 * @name spawn
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in an object
 * @param {String} [command] the external pipeline is described in an URL-like command
 * @param {String} [logger] A dedicaded pipeline described in a file to trap or log errors
 * @param {String} [cache] Use a specific ezs statement to run commands (advanced)
 * @returns {Object}
 */
export default async function spawn(data, feed) {
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
    const cache = this.getParam('cache');
    let statements;
    if (cache) {
        statements = [ezs(cache, { commands }, this.getEnv())];
    } else {
        statements = ezs.compileCommands(commands, this.getEnv());
    }
    const input = ezs.createStream(ezs.objectMode());
    const logger = ezs.createTrap(this.getParam('logger'), this.getEnv());
    const output = ezs.createPipeline(input, statements, logger)
        .pipe(ezs.catch((e) => feed.write(e))); // avoid to break pipeline at each error
    ezs.writeTo(input, data, () => input.end());
    await feed.flow(output, { autoclose: false });
}
