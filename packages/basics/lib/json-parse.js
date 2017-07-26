'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _JSONStream = require('JSONStream');

var _JSONStream2 = _interopRequireDefault(_JSONStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function JSONParse(data, feed) {
    if (!this.handle) {
        var separator = this.getParam('separator', '*');
        this.handle = _JSONStream2.default.parse(separator);
        this.handle.on('data', function (obj) {
            feed.write(obj);
        });
    }
    if (!this.isLast()) {
        this.handle.write(data);
        feed.end();
    } else {
        feed.close();
    }
}

exports.default = {
    JSONParse: JSONParse
};