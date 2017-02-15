const OBJ = require('dot-prop');
const request = require('request');
const url = require('url');

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
    let urlObj = {
      url : url.format(handle),
      method: "GET",
      json: true
    }
    request(urlObj, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (handle === undefined) {
          feed.send(body);
        }
        else {
          OBJ.set(data, path, body);
          feed.send(data);
        }
      }
      else {
        throw error;
      }
    })
  }
}

