import _ from 'lodash';

const makeMetric = (labels) => {
    const timestamp = Date.now();
    return (name, value) => process.stderr.write(`${name}{${labels}} ${value} ${timestamp}\n`);
};
/**
 * Take `Object` and throw the same `Object`
 * But in print some Prometheus metrics
 *
 * @name metrics
 * @param {String} [stage=default] Stage name
 * @param {String} [bucket=unknow] Bucket name (script name)
 * @param {String} [frequency=10] number of chunk between two metrics computation
 * @returns {Object}
 */
export default function metrics(data, feed) {
    if (!this.metric) {
        const stages = []
            .concat(this.getParam('stage', 'default'))
            .filter(Boolean)
            .map(_.snakeCase)
            .map((s) => (`stage=${s}`))
            .join('');
        const buckets = []
            .concat(this.getParam('bucket', 'unknow'))
            .filter(Boolean)
            .map(_.snakeCase)
            .map((s) => (`bucket=${s}`))
            .join('');
        const labels = `${stages},${buckets}`;
        this.metric = makeMetric(labels);
    }
    if (!this.total) {
        this.total = 0;
    }
    if (!this.totalBytes) {
        this.totalBytes = 0;
    }
    this.total += 1;
    this.totalBytes += JSON.stringify(data || '').length;
    if (!this.counter) {
        this.counter = 0;
    }
    this.counter += 1;
    const frequency = Number(this.getParam('frequency', 10));
    if (this.isLast() || this.counter >= frequency) {
        this.counter = 0;
        this.metric('ezs_statement_chunks_count', this.total);
        this.metric('ezs_statement_chunks_bytes', this.totalBytes);
        this.metric('ezs_statement_duration_seconds', this.getCumulativeTime());
        this.metric('ezs_statement_opened_count', this.getCounter());
    }
    if (this.isLast()) {
        return feed.close();
    }
    return feed.send(data);
}
