function CSVObject(data, feed) {
    if (this.isFirst()) {
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
    } else if (Array.isArray(data)) {
        const obj = {};
        data.forEach((item, index) => {
            const columnName = this.columns[index] ? this.columns[index].trim() : 'Column #'.concat(index);
            obj[columnName] = item;
        });
        feed.write(obj);
    } else {
        feed.close();
    }
    feed.end();
}

export default {
    CSVObject,
};
