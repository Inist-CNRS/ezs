/**
 * Take all `Object` and genereta a json array
 *
 * @param {String} [indent=false] indent JSON
 * @returns {String}
 */
export default function dump(data, feed) {
    const indent = this.getParam('indent', false);
    const separator = indent ? ',\n' : ',';
    const spaces = indent ? '    ' : null;
    const openWith = '[';
    const closeWith = ']';
    let output = '';
    if (this.isFirst()) {
        output = openWith;
    } else {
        output = separator;
    }
    if (!this.isLast()) {
        feed.write(output.concat(JSON.stringify(data, null, spaces)));
    } else if (this.isLast() && this.getIndex() > 0) {
        feed.write(closeWith);
        feed.close();
    } else {
        feed.write(openWith + closeWith);
        feed.close();
    }
    return feed.end();
}
