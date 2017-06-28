const request = require('request');
const fs = require('fs');
const co = require('co');

function requestPromise(url) {
  return new Promise((resolve, reject) => {
    request.get(url, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      return resolve(body);
    });
  });
}

module.exports = function getFulltext(data, feed) {
  if (this.isLast()) {
    feed.close();
    return;
  }

  co(function* () {
    for (let i = 0; i < data.hits.length; i += 1) {
      const hit = data.hits[i];
      const id = hit.id;
      let fulltext;
      try {
        fulltext = yield requestPromise(`https://api.istex.fr/document/${id}/fulltext/txt`);
      } catch (e) {
        console.error(e);
        continue;
      }
      fs.writeFile(`${id}.txt`, fulltext, (err) => {
        if (err) {
          /* eslint-disable */
          return console.error(id, err);
          /* eslint-enable */
        }
        return undefined;
      });
    }
  })
  .then(() => {
    feed.write('.');
    feed.end();
  })
  .catch((err) => {
    feed.write('#', err);
    feed.end();
  });
};
