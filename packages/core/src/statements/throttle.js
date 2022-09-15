/**
 * Take `Object` and return the same object
 *
 * ```json
 * [{
 *          { id: 'x', value: 2 },
 *          { id: 't', value: 2 },
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [throttle]
 * bySecond = 2
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *          { id: 'x', value: 2 },
 *          { id: 't', value: 2 },
 * ]
 * ```
 *
 * @name throttle
 * @param {Number} [bySecond=1] Number of object by second
 * @returns {Object}
 */
export default function throttle(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const bysec = Number(this.getParam('bySecond', 1));
    const divs = bysec <= 0 ? 1 : bysec;
    return setTimeout(() => feed.send(data), Math.round(1000 / divs));
}
