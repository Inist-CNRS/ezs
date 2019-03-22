import os from 'os';
import cacache from 'cacache/en';
import path from 'path';

export default class Cache {
    constructor() {
        this.cachePath = path.format({
            root: String(process.env.EZS_CACHE_ROOT || os.tmpdir()),
            name: String(process.env.EZS_CACHE_DIR || '/ezs-booster'),
        });
    }

    has(key) {
        return cacache.get.info(this.cachePath, key)
            .then(i => (i !== null));
    }

    get(key) {
        return new Promise(resolve => resolve(cacache.get.stream(this.cachePath, key)));
    }

    clear() {
        return cacache.rm.all(this.cachePath);
    }

    del(key) {
        return cacache.rm.entry(this.cachePath, key);
    }

    set(key, stream) {
        return new Promise((resolve, reject) => {
            const handle = cacache.put.stream(
                this.cachePath,
                key,
            )
                .on('integrity', resolve)
                .on('error', reject);
            stream.pipe(handle);
        });
    }
}
