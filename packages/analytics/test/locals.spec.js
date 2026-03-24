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
module.exports = {
    erraticError,
}; 
