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
  let func, format = this.getParam('format', 'standard');
  if (format === 'semicolon') {
    func = tocsv;
  }
  else {
    func = CSV.stringify;
  }
  if (this.isLast()) {
    feed.close();
  }
  else if (this.isFirst()) {
    feed.write(func(Object.keys(data)));
    feed.send(func(data));
  }
  else {
    feed.send(func(data));
  }
};
