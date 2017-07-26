'use strict';

var flatten = require('flat');

module.exports = function (data, feed) {
  var opts = {
    delimiter: this.getParam('separator', '/')
  };
  if (this.isLast()) {
    feed.close();
  } else {
    feed.send(flatten(data, opts));
  }
};