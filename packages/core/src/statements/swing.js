import _ from 'lodash';

import debug from 'debug';

/**
 * Delegate processing to an external pipeline under specifics conditions
 *
 * > **Note**: works like {@link spawn}, but each chunk shares the same external
 * > pipeline.
 *
 * @name swing
 * @param {String} [test] if test is true
 * @param {String} [reverse=false] reverse the test
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of
 * characters
 * @param {String} [commands] the external pipeline is described in an object
 * @param {String} [command] the external pipeline is described in an URL-like
 * command
 * @returns {Object}
 */
export default function swing(data, feed) {
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
    const reverse = Boolean(this.getParam('reverse', false));
    const tests = []
        .concat(this.getParam('test', true))
        .map((i) => Boolean(i))
        .map((i) => (reverse ? !i : i));

    if (tests.every((test) => test)) {
        return ezs.writeTo(this.input, data, () => feed.end());
    }
    return feed.send(data);
}
