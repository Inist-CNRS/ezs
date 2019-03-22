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
        return setTimeout(() => feed.close(), 1);
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
        return feed.close();
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
    this.getParam('object', {});
    return feed.send(data);
}

function beat(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return setTimeout(() => {
        feed.write({ beat: 1 });
        feed.end();
    }, 1);
}

function boum(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return feed.send(new Error('Boum!'));
}

// WARNING : https://bytearcher.com/articles/why-asynchronous-exceptions-are-uncatchable/
function badaboum(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return setTimeout(() => {
        throw new Error('Badaboum!');
    }, 1);
}

function bang(data, feed) {
    throw new Error('Bang!');
}

function plouf(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return setTimeout(() => {
        feed.stop(new Error(`Plouf #${this.getIndex()}`));
    }, 1);
}

function plaf(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return setTimeout(() => {
        if (data === 7) {
            feed.stop(new Error('Plaf!'));
        } else {
            feed.send(data);
        }
    }, 1);
}

function splish(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const p = new Promise((resolve) => {
        resolve(data);
    });
    return p
        .then(d => feed.send(d))
        .catch(() => feed.end());
}

function splash(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const p = new Promise((resolve, reject) => {
        reject(data);
    });
    return p
        .then(d => feed.send(d))
        .catch(() => feed.end());
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
    bang,
    plouf,
    plaf,
    splish,
    splash,
};
