/**
 * Take `String` and throw `Object` builded by JSON.parse on each line
 *
 * @returns {String}
 */
export default function unpack(data, feed) {
    if (this.isLast()) {
        return feed.end();
    }
    this.remainder = this.remainder || '';

    const eol = '\n';

    let lines;
    if (Buffer.isBuffer(data)) {
        lines = data.toString().split(eol);
    } else if (typeof data === 'string') {
        lines = data.split(eol);
    } else {
        lines = ['', ''];
    }
    lines.unshift(this.remainder + lines.shift());
    this.remainder = lines.pop();
    lines.forEach((line) => {
        feed.write(JSON.parse(line));
    });
    feed.end();
}


