import OBJ from 'dot-prop';

export function feedWrite(feed, value, path, data) {
    if (path === undefined) {
        feed.write(value);
    } else if (typeof data === 'object') {
        OBJ.set(data, path, value);
        feed.write(data);
    } else {
        const out = {};
        OBJ.set(out, path, value);
        feed.write(out);
    }
}
