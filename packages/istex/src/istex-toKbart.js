"use strict";
import {toKbart} from "istex-exchange";
import hl from "highland";
import istexExchange from "./istex-exchange";


function ISTEXToKbart (data, feed) {
  if (this.isLast()) {
    return feed.close();
  }
  const source = data === istexExchange.TRIGGER_HEADER ? [] : [data];

  hl(source)
    .through(toKbart({header: this.isFirst()}))
    .stopOnError((err) => {feed.stop(err)})
    .each((kbartLine) => {feed.write(kbartLine)})
    .done(() => {feed.end()});
}

export default {
  ISTEXToKbart
};
