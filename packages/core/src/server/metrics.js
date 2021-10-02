import http from 'http';
import {
    Register,
    Counter,
    Histogram,
    Gauge,
    AggregatorRegistry,
    collectDefaultMetrics,
} from 'prom-client';
import settings from '../settings';



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

if (settings.metricsEnable) {
    collectDefaultMetrics();
}

export const metrics = () => (request, response, next) => {
    const {
        port,
        metricsEnable,
    } = settings;

    if (!metricsEnable) {
        return next();
    }

    if (request.catched || request.pathName !== '/metrics') {
        ezsStreamTotal.labels(request.pathName).inc();
        return next();
    }
    request.catched = true;

    if (!request.workerId) {
        response.set('Content-Type', Register.contentType);
        response.end(Register.metrics());
        response.once('close', next);
        return next();
    }

    const options = {
        hostname: '0.0.0.0',
        port: port + 1,
        path: '/',
        method: 'GET',
        headers: {
            'Content-Type': 'text/plain',
        }
    };

    request.pipe(http.request(options, (source) => source.pipe(response)));
    return true;
};

export function metricsHandle(data, feed) {
    const pathName = this.getParam('pathname', 'default');
    const stage = this.getParam('stage', 'unknow');

    if (!this.total) {
        this.total = 0;
    }
    if (!this.totalBytes) {
        this.totalBytes = 0;
    }
    this.total += 1;
    this.totalBytes += JSON.stringify(data || '').length;
    ezsStatementChunksTotal.labels(pathName, stage).inc();
    if (this.isLast()) {
        ezsStreamStatementOpen.labels(pathName, stage).observe(this.getCounter());
        ezsStreamChunks.labels(pathName, stage).observe(this.total);
        ezsStreamSizeBytes.labels(pathName, stage).observe(this.totalBytes);
        ezsStreamDurationMicroseconds.labels(pathName, stage).observe(this.getCumulativeTimeMS());
        return feed.close();
    }
    return feed.send(data);
}
