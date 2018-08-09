import OBJ from 'dot-prop';
import { newValue } from './utils';

/**
 * Take `Object` containing results of ISTEX API, and returns `hits` value (documents).
 * This should be placed after ISTEXScroll.
 *
 * @see ISTEXScroll
 * @param {string} [source=data]
 * @param {string} [target=feed]
 * @returns {Array<Object>}
 */
function ISTEXResult(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const source = this.getParam('source');
    const target = this.getParam('target');
    const handle = source ? OBJ.get(data, source) : data;

    const result = handle.hits || [];
    result.forEach((hitObj) => {
        feed.write(newValue({ ...hitObj }, target, data));
    });
    feed.end();
}

export default {
    ISTEXResult,
};
