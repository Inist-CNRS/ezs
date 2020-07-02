'use strict';
import {exchange} from 'istex-exchange';
import hl from 'highland';
import _ from 'lodash';


export default function ISTEXExchange (data, feed) {
  if (this.isFirst()) {
    this.__exchanger = buildExchangerStream(this.getParams());
  }

  if (this.isLast()) {
    return this.__exchanger.close(() => {
      this.__exchanger.feeder(feed);
      feed.close();
    })
  }

  this.__exchanger.feeder(feed);
  this.__exchanger.write(data, () => {feed.end()});
}


// helpers
function buildExchangerStream (params) {
  const exchangeParams = _.pick(params,
                                ['apiUrl', 'reviewUrl', 'parallel', 'doProfile', 'doWarn', 'doLogError', 'doLogEndInfo']
  );

  const exchanger = exchange(exchangeParams),
        inStream  = hl(),
        outStream = inStream.through(exchanger);

  const __exchanger = {
    inStream,
    outStream,
    results     : [],
    processError: null,
    feeder,
    write,
    close
  };

  outStream.on('data', (data) => {__exchanger.results.push(data);});
  outStream.on('error', (err) => {__exchanger.processError = err;});

  return __exchanger;
}

function write (data, cb) {
  if (!this.inStream.write(data)) {
    this.inStream.once('drain', cb);
  } else {
    process.nextTick(cb);
  }
}

function close (cb) {
  this.outStream.once('end', cb);
  this.inStream.write(hl.nil);
}

function feeder (feed) {
  if (this.processError) {return feed.stop(this.processError)}
  while (this.results.length) {
    feed.write(this.results.shift());
  }
}

