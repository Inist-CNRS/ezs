import { get, unset } from 'lodash';
/**
 * Format the output with data a meta
 *
 * @example <caption>Input</caption>
 * [
 *      { _id: 1, value: 2, total: 2 },
 *      { _id: 2, value: 4, total: 2 }
 * ]
 *
 * @example <caption>Script</caption>
 *  .pipe(ezs('output', { meta: 'total' }))
 *
 * @example <caption>Output</caption>
 * {
 *     data: [
 *         { _id: 1, value: 2 },
 *         { _id: 2, value: 4 }
 *     ],
 *     meta: {
 *         total: 2
 *     }
 * }
 *
 * @name output
 * @param {boolean}  [indent=false]  indent or not
 * @param {string[]} [meta]       fields to be considered as metadata
 *                                   object
 * @returns {string}
 */
function output(data, feed) {
    const indent = this.getParam('indent', false);
    const extract = this.getParam('meta');
    const extracts = Array.isArray(extract) ? extract : [extract];
    const keys = extracts.filter((x) => x);
    const cr = indent ? '\n    ' : '';

    const json = (d) => JSON.stringify(d, null, indent ? '    ' : null);

    if (this.isLast()) {
        feed.write(`]}${cr}`);
        return feed.close();
    }
    if (this.isFirst() && !this.isLast()) {
        const values = keys.map((p) => get(data, p));
        feed.write(`{${cr}"meta":{${cr}`);
        if (keys.length > 0) {
            let check = false;
            keys.forEach((k, index) => {
                if (values[index]) {
                    feed.write(!check ? ' ' : ',');
                    check = true;
                    feed.write(json(k));
                    feed.write(':');
                    feed.write(json(values[index]));
                }
            });
        }
        feed.write(`},${cr}"data":[${cr}`);
    } else {
        feed.write(`,${cr}`);
    }
    keys.forEach((p) => unset(data, p));
    feed.write(json(data));
    return feed.end();
}
export default {
    output,
};
