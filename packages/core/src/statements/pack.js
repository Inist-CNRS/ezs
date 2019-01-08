/**
 * Take all `Object`, throw encoded `String`
 *
 * @returns {String}
 */
export default function pack(data, feed) {
    const eol = '\n';
    if (this.isLast()) {
        return feed.send(data);
    }
    return feed.send(JSON.stringify(data).concat(eol));
}
