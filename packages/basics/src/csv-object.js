function CSVObject(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    if (!this.columns) {
        this.columns = Array().concat(data).map((name) => String(name).replace(/\./g, ''));

        const countCols = {};
        const renamedCols = {};
        this.columns.forEach((colname) => {
            countCols[colname] = !countCols[colname]
                ? 1
                : countCols[colname] + 1;
        });
        this.columns = this.columns.map((colname) => {
            if (countCols[colname] > 1) {
                renamedCols[colname] = !renamedCols[colname]
                    ? 1
                    : renamedCols[colname] + 1;
                return colname + renamedCols[colname];
            }
            return colname;
        });
        return feed.end();
    }

    if (Array.isArray(data)) {
        const obj = {};
        data.forEach((item, index) => {
            const columnName = this.columns[index]
                ? this.columns[index].trim()
                : 'Column #'.concat(String(index));
            obj[columnName] = item;
        });
        return feed.send(obj);
    }

    feed.end();
}

/**
 * Take an `Array` of arrays and transform rows into objects.
 *
 * Each row (Array) is tranformed into an object where keys are the values of
 * the first row.
 *
 * See {@link CSVParse}.
 *
 * Input:
 *
 * ```json
 * [
 *   ["a", "b", "c"],
 *   [1, 2, 3],
 *   [4, 5, 6]
 * ]
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *  "a": 1,
 *  "b": 2,
 *  "c": 3
 * }, {
 *  "a": 4,
 *  "b": 5,
 *  "c": 6
 * }]
 * ```
 * > **Tip**: this is useful after a CSVParse, to convert raw rows into n array
 * > of Javascript objects
 *
 * When several values of the first row are the same, produced keys are suffixed
 * with a number.
 *
 * Input:
 *
 * ```json
 * [
 *   ["a", "a", "b", "b", "b"],
 *   [1, 2, 3, 4, 5]
 * ]
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    "a1": 1,
 *    "a2": 2,
 *    "b1": 3,
 *    "b2": 4,
 *    "b3": 5
 * }]
 * ```
 *
 * @name CSVObject
 * @param {undefined} none
 * @returns {Object|Object[]}
 */
export default {
    CSVObject,
};
