/**
 * Take `Object` and throw the same object
 *
 * @name transit
 * @returns {Object}
 */
export default function transit(data, feed) {
    return feed.send(data);
}


