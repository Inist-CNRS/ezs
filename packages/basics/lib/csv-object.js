'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function CSVObject(data, feed) {
    var _this = this;

    if (this.isFirst()) {
        this.columns = data.map(function (name) {
            return name.replace(/\./g, '');
        });

        var countCols = {};
        var renamedCols = {};
        this.columns.forEach(function (colname) {
            countCols[colname] = !countCols[colname] ? 1 : countCols[colname] + 1;
        });
        this.columns = this.columns.map(function (colname) {
            if (countCols[colname] > 1) {
                renamedCols[colname] = !renamedCols[colname] ? 1 : renamedCols[colname] + 1;
                return colname + renamedCols[colname];
            }
            return colname;
        });
    } else if (Array.isArray(data)) {
        var obj = {};
        data.forEach(function (item, index) {
            var columnName = _this.columns[index] ? _this.columns[index].trim() : 'Column #'.concat(index);
            obj[columnName] = item;
        });
        feed.write(obj);
    } else {
        feed.close();
    }
    feed.end();
}

exports.default = {
    CSVObject: CSVObject
};