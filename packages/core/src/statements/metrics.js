import { getMetricLogger }  from '../logger'
let globalCounter = 0;
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
    if (!this.logger) {
        this.logger = getMetricLogger(
            this.getParam('stage', 'default'),
            this.getParam('bucket', 'unknow'),
        );
    }
    if (!this.total) {
        this.total = 0;
        globalCounter += 1;
        this.logger('ezs_statement_starter_counter', globalCounter);
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
        this.logger('ezs_statement_chunks_count', this.total);
        this.logger('ezs_statement_chunks_bytes', this.totalBytes);
        this.logger('ezs_statement_duration_seconds', this.getCumulativeTime());
        this.logger('ezs_statement_opened_count', this.getCounter());
    }
    if (this.isLast()) {
        return feed.close();
    }
    return feed.send(data);
}
