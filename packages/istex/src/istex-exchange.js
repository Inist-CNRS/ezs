"use strict";
import {exchange} from "@istex/istex-exchange";
import hl from "highland";
import _ from "lodash";

const TRIGGER_HEADER ={};

function ISTEXExchange (data, feed) {
  if (this.isFirst()) {
    feed.write(TRIGGER_HEADER); // Make sure that the kbart header is build even there is an error or no results
    this._exchanger = buildExchangerStream(this);

    this._exchanger.outStream
        .on("data", (exchangeData) => {feed.write(exchangeData);})
        .on("error", (err) => {feed.stop(err);})
    ;
  }
  if (this.isLast()) {
    return this._exchanger.close(() => {
      feed.close();
    });
  }

  this._exchanger.write(data, () => {feed.end();});
}


// helpers
function buildExchangerStream (that) {
  const exchangeParams = _(["apiUrl",
                            "reviewUrl",
                            "parallel",
                            "doFrameByPublicationDate",
                            "doWarn",
                            "doLogError"])
    .transform(
      (accu, value) => accu[value] = that.getParam(value),
      {}
    )
    .omitBy(_.isNil)
    .value()
  ;

  const exchanger = exchange(exchangeParams),
        inStream  = hl(),
        outStream = inStream.through(exchanger);

  const _exchanger = {
    inStream,
    outStream,
    write,
    close
  };


  return _exchanger;
}

function write (data, cb) {
  if (!this.inStream.write(data)) {
    this.inStream.once("drain", cb);
  } else {
    process.nextTick(cb);
  }
}

function close (cb) {
  this.outStream.once("end", cb);
  this.inStream.write(hl.nil);
}

export default {
  ISTEXExchange,
  TRIGGER_HEADER,
};
