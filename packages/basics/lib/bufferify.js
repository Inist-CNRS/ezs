"use strict";

module.exports = function (data, feed) {

  if (this.buf === undefined) {
    this.buf = Buffer.alloc(0);
  }

  if (this.isLast()) {
    //    feed.write(this.buf);
    feed.close();
  } else {
    feed.send(Buffer.from(data));
    /*
    let curbuf = Buffer.from(data);
    if (this.buf.length + curbuf.length >= 16384) {
      feed.write(this.buf);
      this.buf = Buffer.alloc(0);
    }
    else {
      this.buf = Buffer.concat([this.buf, curbuf], 16384);
    }
    feed.end();
    */
  }
};