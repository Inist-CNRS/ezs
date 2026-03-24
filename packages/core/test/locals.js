import from from 'from';

function flame(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (this.isFirst()) {
        this.input = this.ezs.createStream(this.ezs.objectMode());
    }
    const size = Number(this.getParam('size', 10));
    return feed.flow(from(Array(size).fill(data)));
}


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
        feed.write();
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
function slowAtTheEnd(data, feed) {
    const time2sleep = Number(this.getParam('time', 200));
    if (this.isLast()) {
        return setTimeout(() => feed.close(), time2sleep);
    }
    return feed.send(data);
}

function noclose(data, feed) {
    if (!this.isLast()) {
        return feed.send(data);
    }
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

function beat(_data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return setTimeout(() => {
        feed.write({ beat: 1 });
        feed.end();
    }, 1);
}

function boum(_data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return feed.send(new Error('Boum!'));
}

// WARNING : https://bytearcher.com/articles/why-asynchronous-exceptions-are-uncatchable/
function badaboum(_data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return setTimeout(() => {
        throw new Error('Badaboum!');
    }, 1);
}

function aie(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return setTimeout(() => {
        feed.stop(new Error('aie!'));
    }, 1);
}


function bang() {
    throw new Error('Bang!');
}

function bing(_data, feed) {
    feed.stop(new Error('Bing!'));
}

function plouf(_data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    setTimeout(() => {
        feed.stop(new Error(`Plouf #${this.getIndex()}`));
    }, 2);
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

function plof(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return setTimeout(() => {
        if (data === 7) {
            feed.send(new Error('Plof!'));
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
        .then((d) => feed.send(d))
        .catch(() => feed.end());
}

function splash(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const p = new Promise((_resolve, reject) => {
        reject(data);
    });
    return p
        .then((d) => feed.send(d))
        .catch(() => feed.end());
}

function throttle(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return setTimeout(() => feed.send(data), Number(this.getParam('milliseconds', 500)));
}

function erraticError(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const stop = Boolean(this.getParam('stop', true));
    return setTimeout(() => {
        if (Math.random().toString().slice(-1) === '6' && !this.isFirst()) {
            if (stop) {
                feed.stop(new Error('Stop : Erratic Error'));
            } else {
                feed.send(new Error('Warning : Erratic Error'));
            }
        } else {
            feed.send(data);
        }
    }, 1);
}

export default {
    plus1,
    boum,
    increment,
    decrement,
    stepper,
    slow,
    slowAtTheEnd,
    noclose,
    aie,
    bad,
    accu,
    beat,
    ignoreMe,
    badaboum,
    bang,
    bing,
    plouf,
    plaf,
    plof,
    splish,
    splash,
    throttle,
    erraticError,
    flame,
};
