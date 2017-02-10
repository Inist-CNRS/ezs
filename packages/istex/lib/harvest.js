const request = require('request');
const QueryString = require('qs');
const url = require('url');

module.exports = function(data, feed) {
  let size = this.getParam('size', 100);
  if (this.isLast()) {
    feed.close();
  }
  else {
    let urlObj = {
      url : url.format(data),
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
            feed.write(urlObj);
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

