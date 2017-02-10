
module.exports = function(data, feed) {
  if (this.isLast()) {
    feed.close();
  }
  else {
    let w = data['hits'] || [];
    w.forEach(x => {
      feed.write(x);
    });
    feed.end();
  }
}

