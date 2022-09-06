import _ from 'lodash';
import from from 'from';
import toArray from 'stream-to-array';

/**
 * From an array field delegate processing of each items to an external pipeline
 *
 * > **Note**: works like {@link delegate}, but each chunk use its own external pipeline
 *
 * @name map
 * @param {String} [path] the path to substitute
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in an object
 * @param {String} [command] the external pipeline is described in an URL-like command
 * @returns {Object}
 */
export default async function map(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { ezs } = this;
    if (!this.createStatements) {
        const commands = ezs.createCommands({
            file: this.getParam('file'),
            script: this.getParam('script'),
            command: this.getParam('command'),
            commands: this.getParam('commands'),
            prepend: this.getParam('prepend'),
            append: this.getParam('append'),
        });
        this.createStatements = () => ezs.compileCommands(commands, this.getEnv());
    }
    const path = this.getParam('path');
    const value = _.get(data, path);
    if (!value || !Array.isArray(value) || value.length === 0) {
        return feed.send(data);
    }
    const output = ezs.createPipeline(from(value), this.createStatements());
    try {
        const newValue = await toArray(output);
        _.set(data, path, newValue);
        return feed.send(data);
    }
    catch (err) {
        return feed.stop(err);
    }
}
