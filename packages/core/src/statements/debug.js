import util from 'util';
import debugGlobal from 'debug';
import _ from 'lodash';

/**
 * Take `Object`, print it (with its number), and throw the same object.
 *
 * with ezs debug enabled:
 * every object will be stringify for printed and all others ezs debug traces will be print
 *
 * with ezs debug disabled:
 * every objects will be inspected (indented and colorized) and print on stderr (error level) or stdout (log level)
 *
 * if ezs parameter is set, every object are not log (it's a global action)
 *
 * @name debug
 * @param {String} [level=error] console level : log or error or silent
 * @param {String} [text=valueOf] text before the dump
 * @param {String} [path] path of field to print
 * @param {Boolean} [ezs] enable or disable ezs global debug traces
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
    const mode = this.getParam('ezs', null);

    if (mode !== null && Boolean(mode) === true && debugGlobal.enabled('ezs') === false) {
        debugGlobal.enable('ezs');
    }
    if (mode !== null && Boolean(mode) === false && debugGlobal.enabled('ezs') === true) {
        debugGlobal.enable('-ezs');
        return feed.send(data);
    }
    const logTitle = text.concat('#').concat(this.getIndex()).concat(' ->');
    if (debugGlobal.enabled('ezs')) {
        if (mode === null) {
            debugGlobal('ezs')(logTitle, JSON.stringify(output));
        }
        return feed.send(data);
    }
    // eslint-disable-next-line
    const logFunc = console[level];
    if (typeof logFunc === 'function') {
        const logOpts = { showHidden: false, depth: 3, colors: true };
        const logDetails = util.inspect(output, logOpts);
        logFunc(logTitle, logDetails);
    }
    return feed.send(data);
}
