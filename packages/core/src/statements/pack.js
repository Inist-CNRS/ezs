/**
 * Take all `Object`, throw encoded `String`
 *
 * @returns {String}
 */
const eol = '\n';
export default function pack(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return feed.send(JSON.stringify(data).concat(eol));
}
