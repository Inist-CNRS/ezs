import util from 'util';
/**
 * Take `Object` , print it and throw the same object
 *
 * @name debug
 * @param {String} [level=log] console level : log or error
 * @param {String} [text=valueOf] text before the dump
 * @returns {Object}
 */
export default function debug(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const level = this.getParam('level', 'error');
    const text = this.getParam('text', 'valueOf');
    if (typeof console[level] === 'function') {
        const logOpts = { showHidden: false, depth: 3, colors: true };
        const logFunc = console[level];
        logFunc(text.concat('#').concat(this.getIndex()).concat(' ->'), util.inspect(data, logOpts));
    }
    return feed.send(data);
}



