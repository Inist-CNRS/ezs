function JSONString(data, feed) {
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
    if (!this.isLast()) {
        feed.write(output.concat(JSON.stringify(data, null, spaces)));
    } else if (this.isLast() && this.getIndex() > 0) {
        feed.write(closeWith);
        feed.close();
    } else {
        feed.write(openWith + closeWith);
        feed.close();
    }
    feed.end();
}

/**
 * Take `Object` and generate JSON
 *
 * @name JSONString
 * @alias jsonify
 * @param {String} [wrap=true] every document are wrapped into an array
 * @param {String} [indent=false] indent JSON
 * @returns {String}
 */
export default {
    JSONString,
};
