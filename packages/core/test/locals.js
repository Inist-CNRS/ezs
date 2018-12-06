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
    const time2sleep = Number(this.getParam('time', 200));
    if (this.isLast()) {
        return setTimeout(() => {
            return feed.close();
        }, 1);
    }
    return setTimeout(() => {
        feed.write(data);
        setTimeout(() => {
            feed.write(data);
            feed.end();
        }, time2sleep);
    }, time2sleep);
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

function beat(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    return setTimeout(() => {
        feed.write({ beat: 1 });
        feed.end();
    }, 1);
}

// WARNING : https://bytearcher.com/articles/why-asynchronous-exceptions-are-uncatchable/
function badaboum(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    return setTimeout(() => {
        throw new Error('Badaboum!');
    }, 1);
}

function plouf(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    return setTimeout(() => {
        feed.stop(new Error('Plouf!'));
    }, 1);
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
    beat,
    ignoreMe,
    badaboum,
    plouf,
};

