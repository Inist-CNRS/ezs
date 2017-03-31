const OBJ = require('dot-prop');
const clone = require('clone');

module.exports = function mods(data, feed) {
  const path = this.getParam('path', 'handle');
  let handle = OBJ.get(data, path);
  if (handle === undefined) {
    handle = data;
  }

  if (this.isLast()) {
    feed.close();
  } else {
    const w = handle.hits || [];
    w.forEach((x) => {
      const urlObj = {
        protocol: 'https:',
        host: 'api.istex.fr',
        pathname: '/document/',
      };
      urlObj.pathname = urlObj.pathname.concat(x.id).concat('/metadata/mods');
      if (handle === undefined) {
        feed.write(urlObj);
      } else {
        const out = clone(data);
        OBJ.set(out, path, urlObj);
        feed.write(out);
      }
    });
    feed.end();
  }
};

