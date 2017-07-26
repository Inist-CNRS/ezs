const JBJ = require('jbj')
module.exports = function(data, feed) {
  if (this.isLast()) {
    feed.close();
  }
  else {
    JBJ.inject(this.getParams(), data, function(err, out) {
      feed.send(err || out)
    });
  }
}
