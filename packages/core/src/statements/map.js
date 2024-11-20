import _ from 'lodash';
import debug from 'debug';
import from from 'from';

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
 * @param {String} [logger] A dedicaded pipeline described in a file to trap or log errors
 * @returns {Object}
 */
export default function map(data, feed) {
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
    const value= []
        .concat(_.get(data, path))
        .filter(Boolean);
    if (!value.length === 0) {
        return feed.send(data);
    }
    const newValue = [];
    const logger = ezs.createTrap(this.getParam('logger'), this.getEnv());
    const output = ezs.createPipeline(from(value), this.createStatements(), logger);
    return output
        .pipe(ezs.catch())
        .on('error', (error) => {
            debug('ezs:warn')('Map ignore a item', error);
            feed.send(error);
        })
        .on('data', (chunk) => {
            newValue.push(chunk);
        })
        .on('end', () => {
            _.set(data, path, newValue);
            return feed.send(data);
        });
}
