'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _xmlSplitter = require('xml-splitter');

var _xmlSplitter2 = _interopRequireDefault(_xmlSplitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function XMLParse(data, feed) {
    if (!this.handle) {
        var separator = this.getParam('separator', '/');
        this.handle = new _xmlSplitter2.default(separator);
        this.handle.on('data', function (obj) {
            feed.write(obj);
        });
    }
    if (!this.isLast()) {
        this.handle.stream.write(data);
    }
    feed.end();
}

exports.default = {
    XMLParse: XMLParse
};