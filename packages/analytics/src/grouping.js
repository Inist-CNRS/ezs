/**
 * Take `Object` like { _id, value } and reduce all value with the same id in single object
 *
 * @name reducing
 * @param {undefined} none
 * @returns {Object}
 */
export default function reducing(data, feed) {
    if (this.isFirst()) {
        this.stats = { };
    }
    if (this.isLast()) {
        Object.keys(this.stats).forEach(key => feed.write({ _id: key, value: this.stats[key] }));
        feed.close();
        return;
    }
    const id = data._id;
    const val = data.value;
    if (id && val) {
        if (this.stats[id] === undefined) {
            this.stats[id] = [];
        }
        this.stats[id].push(val);
    }

    feed.end();
}
