function _shuffle(input) {
    const a = input.split('');
    const n = a.length;

    for(let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join('');
}

/**
 * Take `Object`, shuffle data of the whole object or only some fields specified by path
 *
 * @param {String} [path] path of field to shuffle
 * @returns {Object}
 */
export default function shuffle(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const path = this.getParam('path', []);
    const keys = Array.isArray(path) ? path : [path];
    const output = {};

    if (keys.length === 0) {
        Object.keys(data).forEach(key => {
            output[key] = _shuffle(data[key]);
        });
    } else {
        Object.keys(data).forEach(key => {
            if (keys.indexOf(key) === -1) {
                output[key] = data[key];
            } else {
                output[key] = _shuffle(data[key]);
            }
        });
    }
    feed.send(output);
}
