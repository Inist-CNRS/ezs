import get from 'lodash.get';
import unset from 'lodash.unset';

function formatOutput(data, feed) {
    const keyName = this.getParam('keyName', 'data');
    const indent = this.getParam('indent', false);
    const extract = this.getParam('extract');
    const extracts = Array.isArray(extract) ? extract : [extract];
    const keys = extracts.filter(x => x);

    const json = d => JSON.stringify(d, null, indent ? '    ' : null);

    if (this.isLast()) {
        feed.write(']}\n');
        return feed.close();
    }
    if (this.isFirst() && !this.isLast()) {
        const values = keys.map(p => get(data, p));
        feed.write('{');
        if (keys.length > 0) {
            keys.forEach((k, index) => {
                if (values[index]) {
                    feed.write(index === 0 ? ' ' : ',');
                    feed.write(json(k));
                    feed.write(':');
                    feed.write(json(values[index]));
                }
            });
            feed.write(',');
        }
        feed.write(`"${keyName}":[`);
    } else {
        feed.write(',\n');
    }
    keys.forEach(p => unset(data, p));
    feed.write(json(data));
    return feed.end();
}
export default {
    formatOutput,
};
