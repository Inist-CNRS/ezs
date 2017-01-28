module.exports = function (data, feed) {
  if (this.isLast()) {
    feed.close();
  }
  else {
    feed.send(data.toString());
  }
}
