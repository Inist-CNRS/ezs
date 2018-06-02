function plus1(data, feed) {
    feed.send(data + 1);
}

function boum(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    return feed.send(new Error('Boum!'));
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

function stepper(data, feed) {
    if (!this.isLast()) {
        const step = this.getParam('step');
        const sign = this.getParam('sign', '+');
        const value = data || 0;
        if (sign === '+') {
            feed.send(value + step);
        } else {
            feed.send(value - step);
        }
    } else {
        feed.send(data);
    }
}

function slow(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    feed.write(data);
    return setTimeout(() => {
        feed.write(data);
        feed.end();
    }, 100);
}

function bad(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    feed.end();
    return feed.write(data);
}

function accu(data, feed) {
    if (!this.buff) {
        this.buff = [];
    }
    if (this.isLast()) {
        setTimeout(() => {
            this.buff.forEach((item) => {
                feed.write(item);
            });
            feed.close();
        }, 500);
    } else {
        this.buff.push(data);
        feed.end();
    }
}

function ignoreMe(data, feed) {
    const objParam = this.getParam('object', {});
    return feed.send(data);
}


module.exports = {
    plus1,
    boum,
    increment,
    decrement,
    stepper,
    slow,
    bad,
    accu,
    ignoreMe
};

