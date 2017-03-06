const JSONStream = require('JSONStream');
module.exports = function(data, feed) {
  if (!this.handle) {
    this.handle = JSONStream.parse(this.getParam('separator', '*'));
    this.handle.on('data', function(obj) {
      feed.write(obj);
    });
  }
  if (! this.isLast()) {
    this.handle.write(data);
    feed.end();
  }
  else {
    feed.close();
  }
};
