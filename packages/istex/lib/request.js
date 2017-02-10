const request = require('request');
const url = require('url');

module.exports = function(data, feed) {
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
        feed.send(body);
      }
      else {
        throw error;
      }
    })
  }
}

