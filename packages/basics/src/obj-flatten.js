import flatten from 'flat';

function OBJFlatten(data, feed) {
    const opts = {
        delimiter: this.getParam('separator', '/'),
    };
    if (this.isLast()) {
        feed.close();
    } else {
        feed.send(flatten(data, opts));
    }
}

export default {
    OBJFlatten,
};
