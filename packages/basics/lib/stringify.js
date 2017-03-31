module.exports = function stringify(data, feed) {
  if (this.isLast()) {
    feed.close();
  } else {
    feed.send(data.toString());
  }
};
