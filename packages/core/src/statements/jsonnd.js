/**
 * Take all `Object`, throw encoded `String`
 *
 * @returns {String}
 */
export default function jsonnd(data, feed) {
    const eol = '\n';
    if (this.isLast()) {
        return feed.send(data);
    }
    return feed.send(JSON.stringify(data).concat(eol));
}

