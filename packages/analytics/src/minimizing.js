/**
 * Take special `Object` like {_id, value} and replace value with the min of values
 *
 * @name minimizing
 * @returns {Object}
 */
export default function minimizing(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const id = data._id;
    const val = data.value;
    if (id && val) {
        feed.write({
            _id: id,
            value: val.map(x => Number(x)).reduce((a, b) => (a < b ? a : b)),
        });
    }
    feed.end();
}
