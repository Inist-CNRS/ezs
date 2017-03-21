const CSV  = require('csv-string')
module.exports = function(data, feed) {
  if (!this.handle) {
    this.handle = CSV.createStream(this.getParams());
    this.handle.on('data', function(obj) {
      feed.write(obj);
    })
  }
  if (! this.isLast()) {
    this.handle.write(data);
    feed.end();
  }
  else {
    this.handle.end();
    feed.close();
  }
}
