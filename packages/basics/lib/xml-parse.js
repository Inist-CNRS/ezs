const XMLSplitter = require('xml-splitter')
module.exports = function (data, feed) {
  if (!this.handle) {
    this.handle = new XMLSplitter(this.getParam('separator', '/'));
    this.handle.on('data', function(obj) {
      feed.write(obj);
    })
  }
  if (! this.isLast()) {
    this.handle.stream.write(data);
  }
  feed.end();
}
