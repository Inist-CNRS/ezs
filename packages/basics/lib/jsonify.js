module.exports = function (data, feed) {
  let output = '';
  if (this.isFirst()) {
    output = '[';
  }
  else {
    output = ',\n';
  }
  if (! this.isLast()) {
    feed.write(output.concat(JSON.stringify(data)));
  }
  else {
    feed.write(']');
    feed.close();
  }
  feed.end();
}
