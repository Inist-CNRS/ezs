const OBJ = require('dot-prop');
const clone = require('clone');

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
    w.forEach((hitObj) => {
      if (handle === undefined) {
        feed.write(hitObj);
      } else {
        const out = clone(data);
        OBJ.set(out, path, hitObj);
        feed.write(out);
      }
    });
    feed.end();
  }
};

