function TXTParse(data, feed) {
    if (this.isLast()) {
        return feed.end();
    }
    this.remainder = this.remainder || '';

    let separator;
    try {
        const val = '"'.concat(this.getParam('separator', '\n')).concat('"');
        separator = JSON.parse(val);
    } catch (e) {
        separator = '\n';
    }

    let lines;
    if (Buffer.isBuffer(data)) {
        lines = data.toString().split(separator);
    } else if (typeof data === 'string') {
        lines = data.split(separator);
    } else {
        lines = ['', ''];
    }
    lines.unshift(this.remainder + lines.shift());
    this.remainder = lines.pop();
    lines.forEach((line) => {
        feed.write(line);
    });
    feed.end();
}

/**
 * Take `String` and split at each separator found
 *
 * @name TXTParse
 * @alias split
 * @alias segmenter
 * @param {String} [separtor=\n] choose character which trigger the split
 * @returns {String}
 */
export default {
    TXTParse,
};
