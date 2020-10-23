/**
 * Take `Object` and remove it from the feed if test is true
 * Input file:
 *
 * ```json
 * [{
 *    a: 'a',
 * },
 * {
 *    a: 2,
 * },
 * {
 *    a: 'b',
 * },
 * {
 *    a: 4,
 * },
 * {
 *    a: 'c',
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [remove]
 * test = get('a).isInteger()
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *     {
 *        a: 2,
 *     },
 *     {
 *        a: 4,
 *     }
 * ]
 * ```
 *
 * @name remove
 * @param {String} [test] if test is true
 * @param {String} [reverse=false] reverse the test
 * @returns {Object}
 */
export default function remove(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const reverse = Boolean(this.getParam('reverse', false));
    const tests = []
        .concat(this.getParam('test'))
        .map((i) => Boolean(i))
        .map((i) => (reverse ? !i : i));

    if (tests.every((test) => test)) {
        return feed.end();
    }
    return feed.send(data);
}
