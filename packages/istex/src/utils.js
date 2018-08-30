import OBJ from 'dot-prop';

export function writeTo(stream, data, cb) {
    if (!stream.write(data)) {
        stream.once('drain', cb);
    } else {
        process.nextTick(cb);
    }
}

export function newValue(value, path, data) {
    if (path === undefined) {
        return value;
    }
    if (typeof data === 'object') {
        const out = {
            ...data,
        };
        OBJ.set(out, path, value);
        return out;
    }
    const out = {};
    OBJ.set(out, path, value);
    return out;
}
