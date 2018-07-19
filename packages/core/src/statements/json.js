/**
 * Take all `String`, throw `Object` builded by JSON.parse
 *
 * @returns {String}
 */
export default function json(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    return feed.send(JSON.parse(data));
}
