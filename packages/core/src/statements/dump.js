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
    if (this.isFirst()) {
        this.opened = true;
        feed.write(openWith);
    }
    if (!this.isFirst() && !this.isLast() && !this.opened) {
        this.opened = true;
        feed.write(openWith.concat(JSON.stringify(data, null, spaces)));
    } else if (!this.isFirst() && !this.isLast()) {
        feed.write(separator.concat(JSON.stringify(data, null, spaces)));
    } else if (this.isFirst() && !this.isLast()) {
        feed.write(JSON.stringify(data, null, spaces));
    } else if (this.isLast() && this.opened) {
        feed.write(closeWith);
        feed.close();
    } else {
        feed.write(openWith + closeWith);
        feed.close();
    }
    return feed.end();
}
