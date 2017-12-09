'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function BOILERPLATE(data, feed) {
    var param = this.getParam('param', 'no parameter');
    if (this.isLast()) {
        return feed.close();
    }
    console.log('param=', param);
    console.log('data=', data);
    feed.send(data);
}

exports.default = {
    BOILERPLATE: BOILERPLATE
};