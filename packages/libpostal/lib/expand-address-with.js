"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = expandAddressWith;

var _nodePostal = _interopRequireDefault(require("@cymen/node-postal"));

var _lodash = _interopRequireDefault(require("lodash.get"));

var _lodash2 = _interopRequireDefault(require("lodash.set"));

var _lodash3 = _interopRequireDefault(require("lodash.clone"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const expand = input => ({
  id: input,
  value: _nodePostal.default.expand.expand_address(String(input).trim()).reduce((obj, cur) => ({ ...obj,
    [cur.component]: cur.value
  }), {})
});

function expandAddressWith(data, feed) {
  const paths = [].concat(this.getParam('path')).filter(Boolean);

  if (this.isLast()) {
    return feed.close();
  }

  const tada = (0, _lodash3.default)(data);
  paths.forEach(path => {
    const value = (0, _lodash.default)(data, path);

    if (Array.isArray(value)) {
      return (0, _lodash2.default)(tada, path, value.map(expand));
    }

    return (0, _lodash2.default)(tada, path, expand(value));
  });
  return feed.send(tada);
}