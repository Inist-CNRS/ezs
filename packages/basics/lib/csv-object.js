module.exports = function(data, feed) {
  if (this.isFirst()) {
    this.columns = data;
    let countCols = {}, renamedCols = {};
    this.columns.forEach((colname, index) => {
      countCols[colname] = (!countCols[colname]) ? 1 : (countCols[colname] + 1)
    })
    this.columns = this.columns.map(colname => {
      if (countCols[colname] > 1) {
        renamedCols[colname] = (!renamedCols[colname]) ? 1 : (renamedCols[colname] + 1)
        return colname + renamedCols[colname];
      }
      else {
        return colname;
      }
    })
  }
  else if (Array.isArray(data)) {
    let obj = {}
    data.forEach((item, index) => {
      let columnName = this.columns[index] ? this.columns[index].trim() : 'Column #'.concat(index);
      obj[columnName] = item;
    })
    feed.write(obj);
  }
  else {
    feed.close();
  }
  feed.end();
}
