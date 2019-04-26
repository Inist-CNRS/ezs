const eol = '\n';
/**
 * Take all `Object`, throw encoded `String`
 *
 * @returns {String}
 */
export default function pack(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return feed.send(JSON.stringify(data).concat(eol));
}
