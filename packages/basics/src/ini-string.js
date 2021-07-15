function INIString(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const cr = this.cr || ''; // avoid cr at the begin
    let output = [];
    Object.keys(data).forEach((key) => {
        if (typeof data[key] === 'object') {
            output.push(`${cr}[${key}]`);
            output = output.concat(
                Object.keys(data[key]).map((cle) =>
                    cle
                        .concat(' = ')
                        .concat(
                            typeof data[key][cle] === 'object'
                                ? JSON.stringify(data[key][cle])
                                : data[key][cle].toString(),
                        ),
                ),
            );
        } else {
            output.push(`${key} = ${data[key]}`);
        }
    });
    this.cr = '\n';
    feed.send(output.join(this.cr).concat(this.cr));
}

/**
 * Take `Object` and generate INI
 *
 * Take an array of ezs's statements in JSON, and yield an ezs script in a
 * string.
 *
 * Input:
 *
 * ```json
 * [
 *     { "param": 1, "section": { "arg1": "a", "arg2": "b" } },
 *     { "param": 1, "section": { "arg1": "a", "arg2": "b" } },
 *     { "section": { "arg1": "a", "arg2": true } },
 *     { "sec1": { "arg1": "a", "arg2": [3, 4, 5] }, "sec2": { "arg1": "a", "arg2": { "x": 1, "y": 2 } } },
 *     { "secvide1": {}, "secvide2": {} },
 * ]
 * ```
 *
 * Output:
 *
 * ```ini
 * param = 1
 * [section]
 * arg1 = a
 * arg2 = b
 * param = 1
 *
 * [section]
 * arg1 = a
 * arg2 = b
 *
 * [section]
 * arg1 = a
 * arg2 = true
 *
 * [sec1]
 * arg1 = a
 * arg2 = [3,4,5]
 *
 * [sec2]
 * arg1 = a
 * arg2 = {"x":1,"y":2}
 *
 * [secvide1]
 *
 * [secvide2]
 * ```
 *
 * @name INIString
 * @returns {String}
 */
export default {
    INIString,
};
