
const OBJ = require('dot-prop');
const QueryString = require('qs');

module.exports = function(data, feed) {
  let path = this.getParam('path', 'query');
  let query = OBJ.get(data, path);
  if (query === undefined) {
    query = data;
  }
  let urlObj = {
    protocol: 'https:',
    host : 'api.istex.fr',
    pathname: '/document/',
    search: QueryString.stringify(query)
  }
  if (this.isLast()) {
    feed.close();
  }
  else {
    feed.send(urlObj);
  }
}

