import http from 'http';
import {
    register,
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

let collected = false;
export const metrics = () => (request, response, next) => {
    const {
        port,
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

/**
 * Take `Object`, and throw the same object.
 *
 * This statement will only be used if :
 *  - EZS_METRICS is enabled
 *  - ezs is running in server mode
 *
 * WARNING: avoid setting bucket to "input" or "output", as these labels are used by ezs.
 * If you do, you risk distorting the associated metrics.
 *
 * @name metrics
 * @see ../server/knownPipeline.js
 * @param {String} [pathName=auto] to identify the script
 * @param {String} [bucket=unknow] to identify the moment of measurement
 * @returns {Object}
 */
export const metricsHandle = (pathNameDefault) => (data, feed, ctx) => {
    const pathName = ctx.getParam('pathName', pathNameDefault);
    const bucket = ctx.getParam('bucket', 'unknow');

    if (!ctx.total) {
        ctx.total = 0;
    }
    if (!ctx.totalBytes) {
        ctx.totalBytes = 0;
    }
    ctx.total += 1;
    ctx.totalBytes += JSON.stringify(data || '').length;
    ezsStatementChunksTotal.labels(pathName, bucket).inc();
    if (ctx.isLast()) {
        ezsStreamStatementOpen.labels(pathName, bucket).observe(ctx.getCounter());
        ezsStreamChunks.labels(pathName, bucket).observe(ctx.total);
        ezsStreamSizeBytes.labels(pathName, bucket).observe(ctx.totalBytes);
        ezsStreamDurationMicroseconds.labels(pathName, bucket).observe(ctx.getCumulativeTimeMS());
        return feed.close();
    }
    return feed.send(data);
};
