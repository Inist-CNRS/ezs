/**
 * Take special `Object` like {_id, value} and replace value with the merge of values
 *
 * @name mergin
 * @returns {Object}
 */
export default function merging(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const id = data._id;
    const val = data.value;
    if (id && val) {
        feed.write({
            _id: id,
            value: val
                .filter(k => typeof k === 'object')
                .reduce((prev, cur) => Object.assign(prev, cur), {}),
        });
    }
    feed.end();
}
