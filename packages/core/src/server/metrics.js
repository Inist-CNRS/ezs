import http from 'http';
import {
    register,
    Counter,
    Histogram,
    Gauge,
    AggregatorRegistry,
    collectDefaultMetrics,
} from 'prom-client';
import getStream from 'get-stream';
import settings from '../settings';

const metricsRootServer = {
    hostname: '0.0.0.0',
    port: settings.port + 1,
    path: '/',
    method: 'GET',
    headers: {
        'Content-Type': 'text/plain',
    }
};



export const ezsServerState = new Gauge({
    name: 'ezs_server_state',
    help: 'Number of different states for each server',
    labelNames: ['pid'],
});

const states = ['Starting', 'Started', 'Stopping', 'Stopped'];
export const changeState = (stateLabel) => {
    const stateIndex = states.indexOf(stateLabel);
    ezsServerState.labels(process.pid).set(stateIndex);
};

export const getSlashMetricsStream = () => new Promise((resolve, reject) => {
    http.request(metricsRootServer, resolve).on('error', reject).end();
});

export const getState = async () => {
    try {
        const metricsStream = await getSlashMetricsStream();
        const metricsString = await getStream(metricsStream);
        return metricsString;
    } catch(e) {
        console.error(e);
        return '';
    }
}
changeState('Starting');

export const aggregatorRegistry = new AggregatorRegistry();

export const httpConnectionTotal = new Counter({
    name: 'http_connection_total',
    help: 'Number of connections'
});

export const httpRequestErrorTotal = new Counter({
    name: 'http_request_error_total',
    help: 'Number of errors',
    labelNames: ['pathName'],
});

export const ezsStreamTotal = new Counter({
    name: 'ezs_stream_total',
    help: 'Number of streams',
    labelNames: ['pathName'],
});

export const httpConnectionOpen = new Gauge({
    name: 'http_connection_open',
    help: 'Number of active connections'
});

export const httpRequestDurationMicroseconds = new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['pathName'],
    // buckets for response time from 0.1ms to 500ms
    buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]
});

export const ezsStatementChunksTotal = new Counter({
    name: 'ezs_statement_chunks_total',
    help: 'Number of chunks recevied',
    labelNames: ['pathName', 'bucket'],
});

export const ezsStreamChunks = new Histogram({
    name: 'ezs_stream_chunks',
    help: 'Number of chunks recevied for one request',
    labelNames: ['pathName', 'bucket'],
});

export const ezsStreamSizeBytes = new Histogram({
    name: 'ezs_stream_size_bytes',
    help: 'Size of ezs stream in bytes',
    labelNames: ['pathName', 'bucket'],
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
});

export const ezsStreamStatementOpen = new Histogram({
    name: 'ezs_stream_statement_open',
    help: 'Number of EZS active statements',
    labelNames: ['pathName', 'bucket'],
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
});

export const ezsStreamDurationMicroseconds = new Histogram({
    name: 'ezs_stream_duration_ms',
    help: 'Duration of EZS statements in ms',
    labelNames: ['pathName', 'bucket'],
    // buckets for response time from 0.1ms to 500ms
    buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]
});

let collected = false;
export const metrics = () => (request, response, next) => {
    const {
        metricsEnable,
    } = settings;

    if (!metricsEnable) {
        return next();
    }
    if (!collected) {
        collected = true;
        collectDefaultMetrics();
    }

    if (request.catched || request.pathName !== '/metrics') {
        ezsStreamTotal.labels(request.pathName).inc();
        return next();
    }
    request.catched = true;

    if (!request.workerId) {
        return register.metrics().then((dump) => {
            response.setHeader('Content-Type', register.contentType);
            response.write(dump);
            response.end();
            response.once('close', next);
        }).catch(next);
    }

    request.pipe(http.request(metricsRootServer, (source) => source.pipe(response)));
    return true;
};

export function metricsHandle(data, feed) {
    const pathName = this.getParam('pathName', 'default');
    const bucket = this.getParam('bucket', 'unknow');

    if (!this.total) {
        this.total = 0;
    }
    if (!this.totalBytes) {
        this.totalBytes = 0;
    }
    this.total += 1;
    this.totalBytes += JSON.stringify(data || '').length;
    ezsStatementChunksTotal.labels(pathName, bucket).inc();
    if (this.isLast()) {
        ezsStreamStatementOpen.labels(pathName, bucket).observe(this.getCounter());
        ezsStreamChunks.labels(pathName, bucket).observe(this.total);
        ezsStreamSizeBytes.labels(pathName, bucket).observe(this.totalBytes);
        ezsStreamDurationMicroseconds.labels(pathName, bucket).observe(this.getCumulativeTimeMS());
        return feed.close();
    }
    return feed.send(data);
}
