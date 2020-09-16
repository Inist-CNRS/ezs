import os from 'os';
import autocast from 'autocast';

const cpus = os.cpus().length;
const concurrency = Number(process.env.EZS_CONCURRENCY || cpus);
const encoding = String(process.env.EZS_ENCODING || 'gzip');
const port = Number(process.env.EZS_PORT || 31976);
const cacheEnable = Boolean(autocast(process.env.EZS_CACHE));
const nShards = Number(process.env.EZS_NSHARDS || 16);
const cacheDelay = Number(process.env.EZS_DELAY || 3600);
const settings = {
    highWaterMark: {
        object: nShards,
        bytes: (nShards * 1024),
    },
    response: {
        checkInterval: 5000,
    },
    concurrency,
    encoding,
    port,
    server: process.env.EZS_SERVER ? String(process.env.EZS_SERVER).split(',').map((h) => h.trim()) : null,
    cacheEnable,
    cacheDelay,
    cache: {
        max: (nShards * 256),
        maxAge: (cacheDelay * 1000),
    },
    queue: {
        concurrency: nShards,
    },
    delegate: String(process.env.EZS_DELEGATE || 'delegate'),
};

export default settings;
