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

export function getTriple(line) {
    let [subject, verb, complement] = line.split('> ', 3);
    subject += '>';
    verb += '>';
    if (complement === '.\n' || complement === '.') {
        // In the case of a verb badly parsed (ex: <uri1> a <uri2>)
        [verb, complement] = verb.split(' ', 2);
    } else if (!complement.endsWith('" .\n') && !complement.endsWith('" .')) {
        // In the case of an URI, split removed the end of the complement
        complement += '>';
    } else if (complement.endsWith('\n')) {
        // In the normal case
        complement = complement.slice(0, -3); // Remove " .\n"
    } else {
        complement = complement.slice(0, -2); // Remove " ."
    }
    return [subject, verb, complement];
}
