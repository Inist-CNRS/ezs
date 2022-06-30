function loopFunc(data, feed) {
    const { ezs } = this;
    if (this.isLast()) {
        return feed.close();
    }
    const { commands, getEnv, getParam } = this.getEnv();

    const depth = this.getParam('depth');
    const maxDepth = this.getParam('maxDepth');
    const reverse = this.getParam('reverse');
    const tests = []
        .concat(getParam('test', false, data))
        .map((i) => Boolean(i))
        .map((i) => (reverse ? !i : i));
    const input = ezs.createStream(ezs.objectMode());
    const statements = ezs.compileCommands(commands, getEnv());
    const output = ezs.createPipeline(input, statements)
        .pipe(ezs(loopFunc, { reverse, depth: depth + 1, maxDepth }, this.getEnv()))
        .pipe(ezs.catch((e) => feed.write(e))); // avoid to break pipeline at each error

    feed.write(data);
    if (depth >= maxDepth) {
        return feed.stop(new Error(`maxDepth (${maxDepth}) limit has been reached`));
    }
    if (tests.every((test) => test)) {
        input.write(data);
        input.end();
        return feed.flow(output);
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
    const maxDepth = Number(this.getParam('maxDepth', 100000));
    const reverse = Boolean(this.getParam('reverse', false));
    const tests = []
        .concat(this.getParam('test', false))
        .map((i) => Boolean(i))
        .map((i) => (reverse ? !i : i));
    const statements = ezs.compileCommands(commands, this.getEnv());
    const input = ezs.createStream(ezs.objectMode());
    const output = ezs.createPipeline(input, statements)
        .pipe(ezs(loopFunc, {
            reverse,
            depth: 1,
            maxDepth,
        }, {
            commands,
            getEnv: this.getEnv,
            getParam: this.getParam,
        }))
        .pipe(ezs.catch((e) => feed.stop(e)));

    feed.write(data);
    if (tests.every((test) => test)) {
        input.write(data);
        input.end();
        return feed.flow(output);
    }
    input.end();
    return feed.end();

}
