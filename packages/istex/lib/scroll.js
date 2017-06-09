const request = require('request');
const url = require('url');

let nextURI;
let json;

/**
 * Get the nextURI in the API and call himself until body have noMoreScrollResults : true
 */
function scrollRecursive(feed) {
  const options = {
    uri: nextURI,
    method: 'GET',
    json,
  };

  request(options, (error, response, body) => {
    if (error) {
      /* eslint-disable */
      console.error('options:', options);
      console.error('error', error);
      console.error(
        'response',
        response && response.statusCode,
        response && response.statusMessage,
        response && response.headers
      );
      /* eslint-enable */
      return feed.end();
    }
    if (body && body.hits && body.hits.length === 0) {
      return feed.end();
    }
    feed.write(body);
    if (body.noMoreScrollResults) {
      return feed.end();
    }
    return scrollRecursive(feed);
  });
}

/**
 * scroll use the scrolling features of API istex
 * data: urlObj in data.ISTEX
 * params:
 * - sid: user agent (lodex by default)
 * - size: number of documents per query (2000 by default)
 */
module.exports = function scroll(data, feed) {
  const sid = this.getParam('sid', 'lodex');
  const size = this.getParam('size', 2000);
  json = this.getParam('json', true);

  if (this.isLast()) {
    feed.close();
    return;
  }

  const urlObj = data.ISTEX;
  urlObj.search += `&scroll=30s&size=${size}&sid=${sid}`;

  const options = {
    uri: url.format(urlObj),
    method: 'GET',
    json,
  };

  request(options, (error, response, body) => {
    if (error) {
      /* eslint-disable */
      console.error('options:', options);
      console.error('error', error);
      console.error('response',
        response.statusCode,
        response.statusMessage,
        response.headers
      );
      /* eslint-enable */
      feed.end();
      return;
    }
    feed.write(body);
    if (!body.noMoreScrollResults) {
      nextURI = body.nextScrollURI;
      scrollRecursive(feed);
    } else {
      feed.end();
    }
  });
};
