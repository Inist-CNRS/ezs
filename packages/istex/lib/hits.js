
module.exports = function(data, feed) {
  let path = this.getParam('path', 'handle');
  let handle = OBJ.get(data, path);
  if (handle === undefined) {
    handle = data;
  }

  if (this.isLast()) {
    feed.close();
  }
  else {
    let w = handle['hits'] || [];
    w.forEach(x => {
      feed.write(x);
    });
    feed.end();
  }
}

