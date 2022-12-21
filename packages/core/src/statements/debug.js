import util from 'util';
import debugGlobal from 'debug';
import _ from 'lodash';

/**
 * Take `Object`, print it (with its number), and throw the same object.
 * if level equal debug, all others ezs debug traces will be print
 *
 * @name debug
 * @param {String} [level=log] console level : log or error or debug
 * @param {String} [text=valueOf] text before the dump
 * @param {String} [path] path of field to print
 * @param {Boolean} [disable=false] disable all debug trace (global and local)
 * @returns {Object}
 */
export default function debug(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const level = String(this.getParam('level', 'error'));
    const text = String(this.getParam('text', 'valueOf'));
    const path = this.getParam('path', []);
    const keys = Array.isArray(path) ? path : [path];
    const output = keys.length === 0 ? data : _.pick(data, keys);
    const disable = Boolean(this.getParam('disable', false));

    if (disable) {
        debugGlobal.enable('-ezs');
        return feed.send(data);
    }
    if (level === 'debug' && !debugGlobal.enabled('ezs')) {
        debugGlobal.enable('ezs');
    }
    const logOpts = { showHidden: false, depth: 3, colors: true };
    const logTitle = text.concat('#').concat(this.getIndex()).concat(' ->');
    const logDetails = util.inspect(output, logOpts);
    // eslint-disable-next-line
    const logFunc = ['error', 'log'].indexOf(level) !== -1 ? console[level] : debugGlobal('ezs');
    logFunc(logTitle, logDetails);
    return feed.send(data);
}
