function INIString(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const cr = this.cr || ''; // avoid cr at the begin
    let output = [];
    Object.keys(data).forEach((key) => {
        if (typeof data[key] === 'object') {
            output.push(`${cr}[${key}]`);
            output = output.concat(Object.keys(data[key]).map((cle) => cle.concat(' = ').concat(
                typeof data[key][cle] === 'object' ? JSON.stringify(data[key][cle]) : data[key][cle].toString(),
            )));
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
 * @name INIString
 * @returns {String}
 */
export default {
    INIString,
};
