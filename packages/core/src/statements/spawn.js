/**
 * Take `Object` and delegate processing to an external pipeline, throw each chunk from the result
 * Note : works like [delegate], but each chunk use its own external pipeline
 *
 * @name spawn
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @param {String} [cache] Use a specific ezs statement to run commands (advanced)
 * @returns {Object}
 */
export default function spawn(data, feed) {
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
    ezs.createPipeline(input, statements)
        .pipe(ezs.catch((e) => feed.write(e))) // avoid to break pipeline at each error
        .on('error', (e) => feed.stop(e))
        .on('data', (d) => feed.write(d))
        .on('end', () => feed.end());
    ezs.writeTo(input, data, () => true);
    return input.end();
}
