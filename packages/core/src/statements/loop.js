function loopFunc(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { input, that } = this.getEnv();
    const reverse = Boolean(this.getParam('reverse', false));
    const tests = []
        .concat(that.getParam('test', true, data)) // tricky !
        .map((i) => Boolean(i))
        .map((i) => (reverse ? !i : i));
    feed.write(data);

    if (tests.every((test) => test)) {
        input.write(data);
        feed.end();
        //        ezs.writeTo(, data, () => feed.end());
    }
    return feed.end();
}
/**
 * Delegate processing to an external pipeline, throw each chunk from the result.
 *
 * > **Note**: works like {@link delegate}, but each chunk use its own external pipeline
 *
 * @name loop
 * @param {String} [test] if test is true
 * @param {String} [reverse=false] reverse the test
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in an object
 * @param {String} [command] the external pipeline is described in an URL-like command
 * @param {String} [cache] Use a specific ezs statement to run commands (advanced)
 * @returns {Object}
 */
export default function loop(data, feed) {
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
    const reverse = Boolean(this.getParam('reverse', false));
    const tests = []
        .concat(this.getParam('test', false))
        .map((i) => Boolean(i))
        .map((i) => (reverse ? !i : i));
    const cache = this.getParam('cache');
    let statements;
    if (cache) {
        statements = [ezs(cache, { commands }, this.getEnv())];
    } else {
        statements = ezs.compileCommands(commands, this.getEnv());
    }
    const input = ezs.createStream(ezs.objectMode());
    const output = ezs.createPipeline(input, statements)
        .pipe(ezs(loopFunc, { reverse }, { input, that: this }))
        .pipe(ezs.catch((e) => feed.write(e))); // avoid to break pipeline at each error

    feed.write(data);
    if (tests.every((test) => test)) {
        ezs.writeTo(input, data, () => feed.end());
        return feed.flow(output);
    }
    return feed.end();

}
