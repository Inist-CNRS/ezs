import CSV from 'csv-string';

function strict(data, sep) {
    const q = new RegExp('"', 'g');
    let line = '';
    let s = '';
    Object.keys(data).forEach((key) => {
        line = line.concat(s.concat('"').concat(data[key].toString().replace(q, '""')).concat('"'));
        s = sep;
    });
    return line.concat('\r\n');
}

function CSVString(data, feed) {
    const format = this.getParam('format', 'standard');
    const sep = this.getParam('separator', ';');
    let func;
    if (format === 'strict') {
        func = strict;
    } else {
        func = CSV.stringify;
    }
    if (this.isLast()) {
        feed.close();
    } else if (this.isFirst()) {
        feed.write(func(Object.keys(data), sep));
        feed.send(func(data, sep));
    } else {
        feed.send(func(data, sep));
    }
}

/**
 * from `Object` transform row  into string
 * where each field is separated with a character
 *
 * @name CSVString
 * @param {String} [format=standard] if set to "strict" the fields will wrapped with double quote
 * @param {String} [separator=;] to indicate the CSV separator
 * @returns {String}
 */
export default {
    CSVString,
};
