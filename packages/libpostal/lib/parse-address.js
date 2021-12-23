"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseAddress;

var _nodePostal = _interopRequireDefault(require("@cymen/node-postal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const parse = input => ({
  id: input,
  value: _nodePostal.default.parser.parse_address(String(input).trim()).reduce((obj, cur) => ({ ...obj,
    [cur.component]: cur.value
  }), {})
});

function parseAddress(data, feed) {
  if (this.isLast()) {
    return feed.close();
  }

  if (Array.isArray(data)) {
    return feed.send(data.map(parse));
  }

  if (typeof data === 'string') {
    return feed.send(parse(data));
  }

  return feed.send(data);
}