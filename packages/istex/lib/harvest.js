const request = require('request');
const QueryString = require('qs');
const url = require('url');
const OBJ = require('dot-prop');
const clone = require('clone');

module.exports = function(data, feed) {
  let path = this.getParam('path', 'handle');
  let handle = OBJ.get(data, path);
  if (handle === undefined) {
    handle = data;
  }
  let size = this.getParam('size', 100);
  if (this.isLast()) {
    feed.close();
  }
  else {
    let urlObj = {
      url : url.format(handle),
      method: "GET",
      json: true
    }
    request(urlObj, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (body['total']) {
          let pages = Math.round(body['total'] / size);
          for(let i = 1; i <= pages; i++) {
            let urlObj = url.parse(body['firstPageURI']);
            let query = QueryString.parse(urlObj.query);
            delete urlObj.path;
            delete urlObj.href;
            delete urlObj.query;
            query.size = size;
            query.from = size * i;
            urlObj.search = QueryString.stringify(query);
            if (handle === undefined) {
              feed.write(urlObj);
            }
            else {
              let out = clone(data);
              OBJ.set(out, path, urlObj);
              feed.write(out);
            }
          }
        }
        feed.end();
      }
      else {
        throw error;
      }
    })
  }
}

