import CSV from 'csv-string';

function strict(data, sep) {
    const q = new RegExp('"', 'g');
    let line = '';
    let s = '';
    Object.keys(data).forEach((key) => {
        line = line.concat(s.concat('"').concat(String(data[key]).replace(q, '""')).concat('"'));
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
 * Take `Object` and transform row  into string
 * where each field is separated with a character
 *
 * @name CSVString
 * @param {String} [format=standard] if set to "strict" the fields will wrapped with double quote
 * @param {String} [separator=;] to indicate the CSV separator
 * @param {Boolean} [header=true] first line contains key name
 * @returns {String}
 */
export default {
    CSVString,
};
