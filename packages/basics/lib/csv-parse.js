'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _csvString = require('csv-string');

var _csvString2 = _interopRequireDefault(_csvString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CSVParse(data, feed) {
    if (!this.handle) {
        this.handle = _csvString2.default.createStream(this.getParams());
        this.handle.on('data', function (obj) {
            feed.write(obj);
        });
    }
    if (!this.isLast()) {
        this.handle.write(data);
        feed.end();
    } else {
        this.handle.end();
        feed.close();
    }
}

exports.default = {
    CSVParse: CSVParse
};