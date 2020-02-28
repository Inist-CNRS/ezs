/**
 * Take all `Object` and generete a JSON array
 *
 * ```json
 * [
 *     { a: 1 },
 *     { a: 2 },
 *     { a: 3 },
 *     { a: 4 },
 *     { a: 5 }
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [dump]
 * indent = true
 *
 * ```
 *
 * Output:
 *
 * ```json
 *  [{
 *     "a": 1
 *    },
 *    {
 *     "a": 2
 *    },
 *    {
 *     "a": 3
 *    },
 *    {
 *     "a": 4
 *    },
 *    {
 *     "a": 5
 *    }
 * ]
 * ```
 * @name dump
 * @param {boolean} [indent=false] indent JSON
 * @returns {String}
 */
export default function dump(data, feed) {
    const indent = this.getParam('indent', false);
    const separator = indent ? ',\n' : ',';
    const spaces = indent ? '    ' : null;
    const openWith = '[';
    const closeWith = ']';
    if (this.isFirst()) {
        this.opened = true;
        feed.write(openWith);
    }
    if (!this.isFirst() && !this.isLast() && !this.opened) {
        this.opened = true;
        feed.send(openWith.concat(JSON.stringify(data, null, spaces)));
    } else if (!this.isFirst() && !this.isLast()) {
        feed.send(separator.concat(JSON.stringify(data, null, spaces)));
    } else if (this.isFirst() && !this.isLast()) {
        feed.send(JSON.stringify(data, null, spaces));
    } else if (this.isLast() && this.opened) {
        feed.write(closeWith);
        feed.close();
    } else {
        feed.write(openWith + closeWith);
        feed.close();
    }
}
