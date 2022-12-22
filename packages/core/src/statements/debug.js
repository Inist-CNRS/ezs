import util from 'util';
import debugGlobal from 'debug';
import _ from 'lodash';

/**
 * Take `Object`, print it (with its number), and throw the same object.
 * with debug level, every object will be stringify for printed and
 * all others ezs debug traces will be print
 * with error and log level, every objects will be inspected (indented and colorized)
 *
 * @name debug
 * @param {String} [level=error] console level : log or error or silent
 * @param {String} [text=valueOf] text before the dump
 * @param {String} [path] path of field to print
 * @param {Boolean} [ezs=false] enable or disable ezs debug trace
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
        debugGlobal('ezs')(logTitle, JSON.stringify(output));
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
