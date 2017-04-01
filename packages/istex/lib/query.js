
const OBJ = require('dot-prop');
const QueryString = require('qs');

module.exports = function ISTEXQuery(data, feed) {
  const path = this.getParam('path', 'ISTEX');
  const params = this.getParam('params', {});
  let handle = OBJ.get(data, path);
  if (handle === undefined) {
    handle = data;
  }
  if (handle) {
    Object.keys(params).forEach((key) => {
      handle[key] = params[key];
    });
  }
  const urlObj = {
    protocol: 'https:',
    host: 'api.istex.fr',
    pathname: '/document/',
    search: QueryString.stringify(handle),
  };
  if (this.isLast()) {
    feed.close();
  } else if (handle === undefined) {
    feed.send(urlObj);
  } else {
    OBJ.set(data, path, urlObj);
    feed.send(data);
  }
};

