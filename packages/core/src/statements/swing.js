import _ from 'lodash';

import debug from 'debug';

/**
 * Takes an `Object` delegate processing to an external pipeline
 * under specifics conditions
 * Note : works like [spawn], but each chunk share the same external pipeline
 *
 * @name swing
 * @param {String} [path] path of the field to test
 * @param {String} [test=equal] condition to swing ("equal" or "not equal"
 * @param {String} [value] value of the new field
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
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
    const paths = [].concat(this.getParam('path')).filter(Boolean);
    const tests = [].concat(this.getParam('test')).filter(Boolean).slice(0, paths.length).map((x) => String(x).trim());
    const values = [].concat(this.getParam('value')).filter(Boolean).slice(0, paths.length);
    if (paths.every((p, i) => {
        const a = _.get(data, p);
        const b = values[i];

        if (tests[i] === 'not equal') {
            return (a !== b);
        }
        return (a === b);
    })) {
        return ezs.writeTo(this.input, data, () => feed.end());
    }
    return feed.send(data);
}
