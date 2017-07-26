import CSV from 'csv-string';

function tocsv(data) {
    const q = new RegExp('"', 'g');
    let line = '';
    let s = '';
    Object.keys(data).forEach((key) => {
        line = line.concat(s.concat('"').concat(data[key].toString().replace(q, '""')).concat('"'));
        s = ';';
    });
    return line.concat('\n');
}

function CSVString(data, feed) {
    const format = this.getParam('format', 'standard');
    let func;
    let sep = this.getParam('separator', ',');

    if (format === 'semicolon') {
        sep = ';';
        func = tocsv;
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
