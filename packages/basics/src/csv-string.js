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

export default {
    CSVString,
};
