import _ from 'lodash';
import settings from './settings';

const { metricsEnable } = settings;
export const getMetricLogger = (stage, bucket) => {
    const stages = []
        .concat(stage)
        .filter(Boolean)
        .map(_.snakeCase)
        .map((s) => (`stage=${s}`))
        .join('');
    const buckets = []
        .concat(bucket)
        .filter(Boolean)
        .map(_.snakeCase)
        .map((s) => (`bucket=${s}`))
        .join('');
    const timestamp = Date.now();
    const labels = `${stages},${buckets}`;
    if (metricsEnable) {
        return (name, value) => process.stderr.write(`${name}{${labels}} ${value} ${timestamp}\n`);
    }
    return (name, value) => true;
};


