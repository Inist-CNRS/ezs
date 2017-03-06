const tmpFilepath = require('tmp-filepath');
const fs = require('fs');
const ezs = require('ezs').use(require('..'));

function writeOn (stream, data, cb) {
  if (!stream.write(data)) {
    stream.once('drain', cb);
  } else {
    process.nextTick(cb);
  }
}

module.exports = function (data1, feed1) {
  let self = this;

  if (self.isFirst()) {
    self.tmpFile = tmpFilepath('.bin');
    self.struct = [];
    self.tmpStream = fs.createWriteStream(self.tmpFile);
    feed1.end();
  }
  else if (self.isLast()) {
    fs.createReadStream(self.tmpFile)
      .pipe(ezs('TXTParse', { separator: '\n' }))
      .pipe(ezs(function(data2, feed2) {
        if (!this.isLast()) {
          var buf = new Buffer(data2, 'base64');
          feed2.send(JSON.parse(buf.toString()));
        }
        else {
          feed2.close();
        }
      }))
      .pipe(ezs(function(data3, feed3) {
        if (this.isLast()) {
          fs.unlink(self.tmpFile, function() {
            feed1.close();
          });
        }
        else {
          let vv = {};
          self.struct.forEach(k => {
            if (!data3[k]) {
              vv[k] = '';
            }
            else {
              vv[k] = data3[k];
            }
          });
          feed1.write(vv);
        }
        feed3.end();
      }));
  }
  else {
    Object.keys(data1).forEach(k => {
      if (self.struct.indexOf(k) === -1) {
        self.struct.push(k);
      }
    });
    writeOn(self.tmpStream,
      new Buffer(JSON.stringify(data1)).toString('base64').concat('\n'),
      function() {
        feed1.end();
      }
    );
  }
};
