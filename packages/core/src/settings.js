import os from 'os';

const cpus = os.cpus().length;
const concurrency = Number(process.env.EZS_CONCURRENCY || cpus);
const encoding = String(process.env.EZS_ENCODING || 'gzip');
const port = Number(process.env.EZS_PORT || 31976);
const cacheEnable = Boolean(process.env.EZS_CACHE || true);
const nShards = Number(process.env.EZS_NSHARDS || 16);
const settings = {
    highWaterMark: {
        object: Number(process.env.EZS_HIGHWATERMARK_OBJECT || nShards),
        bytes: Number(process.env.EZS_HIGHWATERMARK_BYTES || (nShards * 1024)),
    },
    concurrency,
    encoding,
    port,
    server: process.env.EZS_SERVER ? String(process.env.EZS_SERVER).split(',').map((h) => h.trim()) : null,
    cacheEnable,
    cache: {
        max: nShards,
    },
    queue: {
        concurrency,
    },
    delegate: String(process.env.EZS_DELEGATE || 'delegate'),
};

export default settings;
