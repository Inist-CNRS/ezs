import util from 'util';
import _ from 'lodash';

/**
 * Take `Object` , print it and throw the same object
 *
 * @param {String} [level=log] console level : log or error
 * @param {String} [text=valueOf] text before the dump
 * @param {String} [path] path of field to print
 * @returns {Object}
 */
export default function debug(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const level = this.getParam('level', 'error');
    const text = this.getParam('text', 'valueOf');
    const path = this.getParam('path', []);
    const keys = Array.isArray(path) ? path : [path];
    const output = keys.length === 0 ? data : _.pick(data, keys);

    if (typeof console[level] === 'function') {
        const logOpts = { showHidden: false, depth: 3, colors: true };
        const logFunc = console[level];
        logFunc(text.concat('#').concat(this.getIndex()).concat(' ->'), util.inspect(output, logOpts));
    }
    return feed.send(data);
}



