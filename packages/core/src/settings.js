import os from 'os';
import autocast from 'autocast';

const cpus = os.cpus().length;
const concurrency = Number(process.env.EZS_CONCURRENCY || cpus);
const encoding = String(process.env.EZS_ENCODING || 'gzip');
const port = Number(process.env.EZS_PORT || 31976);
const cacheEnable = Boolean(autocast(process.env.EZS_CACHE));
const tracerEnable = Boolean(autocast(process.env.EZS_TRACER));
const metricsEnable = Boolean(autocast(process.env.EZS_METRICS));
const rpcEnable = Boolean(autocast(process.env.EZS_RPC));
const nShards = Number(process.env.EZS_NSHARDS || 16);
const cacheDelay = Number(process.env.EZS_CACHE_DELAY || 3600);
const continueDelay = Number(process.env.EZS_CONTINUE_DELAY || 5);
const pipelineDelay = Number(process.env.EZS_PIPELINE_DELAY || 300);
const settings = {
    highWaterMark: {
        object: nShards,
        bytes: (nShards * 1024),
    },
    response: {
        checkInterval: (continueDelay * 1000),
    },
    concurrency,
    encoding,
    port,
    server: process.env.EZS_SERVER ? String(process.env.EZS_SERVER).split(',').map((h) => h.trim()) : null,
    tracerEnable,
    metricsEnable,
    rpcEnable,
    cacheEnable,
    cacheDelay,
    cache: {
        max: (nShards * 256),
        maxAge: (cacheDelay * 1000),
    },
    queue: {
        concurrency: nShards,
    },
    feed: {
        timeout: (pipelineDelay * 1000)
    },
    delegate: String(process.env.EZS_DELEGATE || 'delegate'),
    title: String(process.env.EZS_TITLE
        || 'EZS Web Services (set EZS_TITLE to change this defautl value)'),
    description: String(process.env.EZS_DESCRIPTION
        || 'Consume or generate data from many various ways. (set EZS_DESCRIPTION to change this default value)'),
};

export default settings;
