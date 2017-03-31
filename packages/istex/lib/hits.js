const OBJ = require('dot-prop');

module.exports = function ISTEXHits(data, feed) {
  const path = this.getParam('path', 'ISTEX');
  let handle = OBJ.get(data, path);
  if (handle === undefined) {
    handle = data;
  }

  if (this.isLast()) {
    feed.close();
  } else {
    const w = handle.hits || [];
    w.forEach((x) => {
      feed.write(x);
    });
    feed.end();
  }
};

