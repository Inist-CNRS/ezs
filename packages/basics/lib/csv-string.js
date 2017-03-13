const CSV  = require('csv-string');

function tocsv(data) {
  let line = '', q = new RegExp('"', 'g'), s = '';
  Object.keys(data).forEach(key => {
    line += s + '"' + data[key].toString().replace(q, '""') + '"';
    s = ';';
  });
  return line + '\n';
}

module.exports = function(data, feed) {
  let func;
  let format = this.getParam('format', 'standard');
  let sep = this.getParam('separator', ',');

  if (format === 'semicolon') {
    sep = ';';
    func = tocsv;
  }
  else {
    func = CSV.stringify;
  }
  if (this.isLast()) {
    feed.close();
  }
  else if (this.isFirst()) {
    feed.write(func(Object.keys(data), sep));
    feed.send(func(data, sep));
  }
  else {
    feed.send(func(data, sep));
  }
};
