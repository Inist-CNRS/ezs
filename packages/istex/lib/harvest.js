const request = require('request');
const QueryString = require('qs');
const url = require('url');
const OBJ = require('dot-prop');
const clone = require('clone');

module.exports = function harvest(data, feed) {
  const path = this.getParam('path', 'ISTEX');
  let handle = OBJ.get(data, path);
  if (handle === undefined) {
    handle = data;
  }
  const size = this.getParam('size', 100);
  if (this.isLast()) {
    feed.close();
  } else {
    const urlObj = {
      url: url.format(handle),
      method: 'GET',
      json: true,
    };
    request(urlObj, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        if (body.total) {
          const pages = Array(Math.ceil(body.total / size)).fill(true);
          pages.forEach((page, i) => {
            const urlObj2 = url.parse(body.firstPageURI);
            const query = QueryString.parse(urlObj2.query);
            delete urlObj2.path;
            delete urlObj2.href;
            delete urlObj2.query;
            query.size = size;
            query.from = size * i;
            urlObj2.search = QueryString.stringify(query);
            if (handle === undefined) {
              feed.write(urlObj2);
            } else {
              const out = clone(data);
              OBJ.set(out, path, urlObj2);
              feed.write(out);
            }
          });
        }
        feed.end();
      } else {
        throw error;
      }
    });
  }
};

