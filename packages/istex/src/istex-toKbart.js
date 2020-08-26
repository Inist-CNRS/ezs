'use strict';
import {toKbart} from 'istex-exchange';
import hl from 'highland';

export default function ISTEXToKbart (data, feed) {
  if (this.isLast()) {
      return feed.close();
  }

  hl([data])
    .through(toKbart({header:this.isFirst()}))
    .stopOnError((err)=>{feed.stop(err)})
    .each((kbartLine)=>{feed.write(kbartLine)})
    .done(()=>{feed.end()});
}
