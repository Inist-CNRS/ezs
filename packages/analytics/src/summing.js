/**
 * Take special `Object` like {_id, value} and replace value with the sum of values
 *
 * @name summing
 * @returns {Object}
 */
export default function summing(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const id = data._id;
    const val = data.value;
    if (id && val) {
        feed.write({
            _id: id,
            value: val.reduce((sum, x) => sum + Number(x), 0),
        });
    }
    feed.end();
}
