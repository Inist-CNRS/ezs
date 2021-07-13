/**
 * Take `Object` and generate JSON
 *
 * Input:
 *
 * ```json
 * [{ "a": 1 }, { "b": 2 }]
 * ```
 *
 * Output:
 *
 * ```json
 * "[{\"a\":1},{\"b\":2}]"
 * ```
 *
 * @name JSONString
 * @param {String} [wrap=true] every document is wrapped into an array
 * @param {String} [indent=false] indent JSON
 * @returns {String}
 */
export default function JSONString(data, feed) {
    const indent = this.getParam('indent', false);
    const wrap = this.getParam('wrap', true);
    const separator = indent ? ',\n' : ',';
    const spaces = indent ? '    ' : null;
    const openWith = wrap ? '[' : '';
    const closeWith = wrap ? ']' : '';
    let output = '';
    if (this.isFirst()) {
        output = openWith;
    } else {
        output = separator;
    }
    if (this.isLast()) {
        feed.write(closeWith);
        return feed.close();
    }
    return feed.send(output.concat(JSON.stringify(data, null, spaces)));
}
