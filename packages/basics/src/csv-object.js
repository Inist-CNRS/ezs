function CSVObject(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    if (!this.columns) {
        this.columns = data.map(name => name.replace(/\./g, ''));

        const countCols = {};
        const renamedCols = {};
        this.columns.forEach((colname) => {
            countCols[colname] = (!countCols[colname]) ? 1 : (countCols[colname] + 1);
        });
        this.columns = this.columns.map((colname) => {
            if (countCols[colname] > 1) {
                renamedCols[colname] = (!renamedCols[colname]) ? 1 : (renamedCols[colname] + 1);
                return colname + renamedCols[colname];
            }
            return colname;
        });
        return feed.end();
    }

    if (Array.isArray(data)) {
        const obj = {};
        data.forEach((item, index) => {
            const columnName = this.columns[index] ? this.columns[index].trim() : 'Column #'.concat(index);
            obj[columnName] = item;
        });
        return feed.send(obj);
    }

    feed.end();
}

/**
 * Take `Array` and transform rows into object.
 * Each row (Array) is tranformed
 * into a object where keys are the value of the first row
 *
 * @name CSVObject
 * @param {undefined} none
 * @returns {Object}
 */
export default {
    CSVObject,
};
