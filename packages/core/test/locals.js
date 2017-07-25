function plus1(data, feed) {
    feed.send(data + 1);
}

function increment(data, feed) {
    if (!this.isLast()) {
        const step = this.getParam('step', 1);
        const value = data || 0;
        feed.send(value + step);
    } else {
        feed.send(data);
    }
}

function decrement(data, feed) {
    if (!this.isLast()) {
        const step = this.getParam('step', 1);
        const value = data || 0;
        feed.send(value - step);
    } else {
        feed.send(data);
    }
}

module.exports = {
    plus1,
    increment,
    decrement,
};

