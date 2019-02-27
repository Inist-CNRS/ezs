import os from 'os';

const settings = {
    highWaterMark: {
        object: Number(process.env.EZS_HIGHWATERMARK_OBJECT || 16),
        bytes: Number(process.env.EZS_HIGHWATERMARK_BYTES || 16384),
    },
    nShards: Number(process.env.EZS_NSHARDS || os.cpus().length),
    encoding: String(process.env.EZS_ENCODING || 'gzip'),
    servePath: process.cwd(),
    cache: {
        root: String(process.env.EZS_CACHE_ROOT || os.tmpdir()),
        dir: String(process.env.EZS_CACHE_DIR || '/ezs'),
        files: Number(process.env.EZS_CACHE_FILES || 100),
        size: String(process.env.EZS_CACHE_SIZE || '1 GB'),
        check: Number(process.env.EZS_CACHE_CHECK || 10),
    },
    port: Number(process.env.EZS_PORT || 31976),
};

export default settings;
