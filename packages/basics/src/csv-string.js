import CSV from 'csv-string';

function strict(data, sep) {
    const q = new RegExp('"', 'g');
    let line = '';
    let s = '';
    Object.keys(data).forEach((key) => {
        line = line.concat(
            s
                .concat('"')
                .concat(String(data[key]).replace(q, '""'))
                .concat('"'),
        );
        s = sep;
    });
    return line.concat('\r\n');
}

function CSVString(data, feed) {
    const format = String(this.getParam('format', 'standard'));
    const sep = String(this.getParam('separator', ';'));
    const header = Boolean(this.getParam('header', true));
    let func;
    if (format === 'strict') {
        func = strict;
    } else {
        func = CSV.stringify;
    }
    if (this.isLast()) {
        feed.close();
    } else if (this.isFirst() && header) {
        feed.write(func(Object.keys(data), sep));
        feed.send(func(data, sep));
    } else {
        feed.send(func(data, sep));
    }
}

/**
 * Take an array of objects and transform row into a string where each field is
 * separated with a character.
 *
 * The resulting string is CSV-compliant.
 *
 * See {@link CSVObject}
 *
 * Input:
 *
 * ```json
 * [{
 *   "a": 1,
 *   "b": 2,
 *   "c": 3
 * }, {
 *   "a": 4,
 *   "b": 5,
 *   "c": 6
 * }]
 * ```
 *
 * Output:
 *
 * ```txt
 * a;b;c
 * 1;2;3
 * 4;5;6
 * ```
 *
 * @name CSVString
 * @param {String} [format=standard] if set to "strict" the fields will be
 *                                   wrapped with double quote
 * @param {String} [separator=";"] to indicate the CSV separator
 * @param {Boolean} [header=true] first line contains key name
 * @returns {String}
 */
export default {
    CSVString,
};
