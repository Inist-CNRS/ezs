'use strict';

var tmpFilepath = require('tmp-filepath');
var fs = require('fs');
var ezs = require('ezs').use(require('..'));

function writeOn(stream, data, cb) {
  if (!stream.write(data)) {
    stream.once('drain', cb);
  } else {
    process.nextTick(cb);
  }
}

module.exports = function (data1, feed1) {
  var self = this;

  if (!self.tmpFile) {
    self.tmpFile = tmpFilepath('.bin');
    self.struct = [];
    self.tmpStream = fs.createWriteStream(self.tmpFile);
  }

  if (self.isLast()) {
    fs.createReadStream(self.tmpFile).pipe(ezs('TXTParse', { separator: '\n' })).pipe(ezs(function (data2, feed2) {
      if (!this.isLast()) {
        var buf = new Buffer(data2, 'base64');
        feed2.send(JSON.parse(buf.toString()));
      } else {
        feed2.close();
      }
    })).pipe(ezs(function (data3, feed3) {
      if (this.isLast()) {
        fs.unlink(self.tmpFile, function () {
          feed1.close();
        });
      } else {
        var vv = {};
        self.struct.forEach(function (k) {
          if (!data3[k]) {
            vv[k] = '';
          } else {
            vv[k] = data3[k];
          }
        });
        feed1.write(vv);
      }
      feed3.end();
    }));
  } else {
    Object.keys(data1).forEach(function (k) {
      if (self.struct.indexOf(k) === -1) {
        self.struct.push(k);
      }
    });
    writeOn(self.tmpStream, new Buffer(JSON.stringify(data1)).toString('base64').concat('\n'), function () {
      feed1.end();
    });
  }
};