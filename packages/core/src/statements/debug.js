import debugGlobal from 'debug';
import _ from 'lodash';

/**
 * Take `Object`, print it (with its index number), and throw the same object.
 *
 * @name debug
 * @param {String} [level=info] DEBUG ezs level (depends of DEBUG env variable, see cli parameters)
 * @param {String} [text=valueOf] text before the dump
 * @param {String} [path] path of field to print
 * @returns {Object}
 */
export default function debug(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const levelRaw = String(this.getParam('level', 'info'));
    const level = ['trace', 'debug', 'info', 'warn', 'error'].includes(levelRaw) ? levelRaw : 'info';
    const text = String(this.getParam('text', 'valueOf'));
    const path = this.getParam('path', []);
    const keys = Array.isArray(path) ? path : [path];
    const output = keys.length === 0 ? data : _.pick(data, keys);

    const logTitle = text.concat('#').concat(this.getIndex()).concat(' ->');
    const debugPrefix = `ezs:${level}`;

    debugGlobal(debugPrefix)(`${logTitle} %j`, output);
    return feed.send(data);
}
