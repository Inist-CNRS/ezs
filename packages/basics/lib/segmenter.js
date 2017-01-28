module.exports = function(data, feed) {

  if (this.isLast()) {
    return feed.end()
  }
  this.remainder = this.remainder || '';
  if (!this._delimiter) {
    try {
      this._delimiter = JSON.parse('"' + this.getParam('separator', '\n') + '"');
    }
    catch (e) {
      this._delimiter = '\n';
    }
  }

  let lines;
  if (Buffer.isBuffer(data)) {
    lines = data.toString().split(this._delimiter);
  }
  else if (typeof data === 'string') {
    lines = data.split(this._delimiter);
  }
  else {
    lines = ['', ''];
  }
  lines.unshift(this.remainder + lines.shift());
  this.remainder = lines.pop();
  lines.forEach(line => {
    feed.write(line);
  })
  feed.end();
}
