import breaker from './breaker';

async function loopFunc(data, feed) {
    const { ezs } = this;
    if (this.isLast()) {
        return feed.close();
    }
    const { commands, getEnv, getParam } = this.getEnv();

    const depth = this.getParam('depth');
    const maxDepth = this.getParam('maxDepth');
    const reverse = this.getParam('reverse');
    const fusible = this.getParam('fusible');
    const control = fusible ? ezs(breaker, { fusible }) : ezs('transit');
    const tests = []
        .concat(getParam('test', false, data))
        .map((i) => Boolean(i))
        .map((i) => (reverse ? !i : i));
    const input = ezs.createStream(ezs.objectMode());
    const statements = ezs.compileCommands(commands, getEnv());
    const output = ezs.createPipeline(input, statements)
        .pipe(control)
        .pipe(ezs(loopFunc, { reverse, depth: depth + 1, maxDepth }, this.getEnv()))
        .pipe(ezs.catch((e) => feed.write(e))); // avoid to break pipeline at each error

    feed.write(data);
    if (depth >= maxDepth) {
        return feed.stop(new Error(`maxDepth (${maxDepth}) limit has been reached`));
    }
    if (tests.every((test) => test)) {
        input.write(data);
        input.end();
        await feed.flow(output);
        return;
    }
    return feed.end();
}
/**
 * Loop on external pipeline, until test will be true
 *
 * > **Note**: works like {@link delegate}, but each chunk use its own external pipeline
 *
 * @name loop
 * @param {String} [test] if test is true
 * @param {Boolean} [reverse=false] to reverse the test
 * @param {Number} [maxDepth=100000] to limit the number of loops
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in an object
 * @param {String} [command] the external pipeline is described in an URL-like command
 * @param {String} [logger] A dedicaded pipeline described in a file to trap or log errors
 * @param {String} [fusible] Can be set with the ezs server fusible see env('request.fusible')
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
    const fusible = this.getParam('fusible', false);
    const tests = []
        .concat(this.getParam('test', false))
        .map((i) => Boolean(i))
        .map((i) => (reverse ? !i : i));
    const statements = ezs.compileCommands(commands, this.getEnv());
    const input = ezs.createStream(ezs.objectMode());
    const logger = ezs.createTrap(this.getParam('logger'), this.getEnv());
    const output = ezs.createPipeline(input, statements, logger)
        .pipe(ezs(loopFunc, {
            reverse,
            depth: 1,
            maxDepth,
            fusible,
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
