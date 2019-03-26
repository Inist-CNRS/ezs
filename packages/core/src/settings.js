import os from 'os';

const cpus = os.cpus().length;

const settings = {
    highWaterMark: {
        object: Number(process.env.EZS_HIGHWATERMARK_OBJECT || 16),
        bytes: Number(process.env.EZS_HIGHWATERMARK_BYTES || 16384),
    },
    queue: {
        concurrency: Number(process.env.EZS_CONCURRENCY || cpus),
    },
    nShards: Number(process.env.EZS_NSHARDS || cpus),
    encoding: String(process.env.EZS_ENCODING || 'gzip'),
    servePath: process.cwd(),
    port: Number(process.env.EZS_PORT || 31976),
};

export default settings;
