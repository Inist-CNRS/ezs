"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseAddress;

var _nodePostal = _interopRequireDefault(require("@cymen/node-postal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const expand = input => ({
  id: input,
  value: _nodePostal.default.expand.expand_address(String(input).trim())
});

function parseAddress(data, feed) {
  if (this.isLast()) {
    return feed.close();
  }

  if (Array.isArray(data)) {
    return feed.send(data.map(expand));
  }

  if (typeof data === 'string') {
    return feed.send(expand(data));
  }

  return feed.send(data);
}