'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _csvString = require('csv-string');

var _csvString2 = _interopRequireDefault(_csvString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function strict(data, sep) {
    var q = new RegExp('"', 'g');
    var line = '';
    var s = '';
    Object.keys(data).forEach(function (key) {
        line = line.concat(s.concat('"').concat(data[key].toString().replace(q, '""')).concat('"'));
        s = sep;
    });
    return line.concat('\r\n');
}

function CSVString(data, feed) {
    var format = this.getParam('format', 'standard');
    var sep = this.getParam('separator', ';');
    var func = void 0;
    if (format === 'strict') {
        func = strict;
    } else {
        func = _csvString2.default.stringify;
    }
    if (this.isLast()) {
        feed.close();
    } else if (this.isFirst()) {
        feed.write(func(Object.keys(data), sep));
        feed.send(func(data, sep));
    } else {
        feed.send(func(data, sep));
    }
}

exports.default = {
    CSVString: CSVString
};