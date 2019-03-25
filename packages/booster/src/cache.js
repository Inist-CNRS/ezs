import os from 'os';
import fs from 'fs';
import cacache from 'cacache/en';
import path from 'path';

export default class Cache {
    constructor(options) {
        this.options = options || {};
        const {
            hitsByCheck,
            cleanupDelay,
            maxFiles,
            maxTotalSize,
            rootPath,
            directoryPath,
        } = this.options;
        this.cachePath = path.format({
            root: String(rootPath || process.env.EZS_CACHE_ROOT || os.tmpdir()),
            name: String(directoryPath || process.env.EZS_CACHE_DIR || '/ezs-booster'),
        });
        if (cleanupDelay && (maxFiles || maxTotalSize)) {
            setInterval(() => {
                this.clean();
            }, cleanupDelay).unref();
        }
        this.hitsByCheck = hitsByCheck || 1000;
        this.hits = 0;
    }

    check() {
        if (this.hits < this.hitsByCheck) {
            return Promise.resolve(true);
        }
        this.hits = 0;
        return cacache.verify(this.cachePath);
    }

    all() {
        return cacache.ls(this.cachePath);
    }

    has(key) {
        return cacache.get.info(this.cachePath, key)
            .then(i => (i !== null));
    }

    get(key) {
        this.hits += 1;
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

    clean() {
        return cacache.ls(this.cachePath)
            .then(info => Object.keys(info).map(k => info[k]))
            .then(entries => Promise.all(entries.map(entry => new Promise((resolve, reject) => fs.stat(
                path.resolve(
                    this.cachePath,
                    entry.path,
                ),
                (err, stats) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve({
                        key: entry.key,
                        atime: stats.atime.getTime(),
                        size: entry.size,
                    });
                },
            )))))
            .then(entriesAugmented => entriesAugmented.sort((a, b) => (a.atime - b.atime)))
            .then((entriesSorted) => {
                const { maxFiles, maxTotalSize } = this.options;
                const toRemove = [];
                if (maxFiles) {
                    while (entriesSorted.length > maxFiles) {
                        toRemove.push(entriesSorted.shift());
                    }
                }

                let size = 0;
                if (maxTotalSize) {
                    while (maxTotalSize > size && entriesSorted.length) {
                        size += entriesSorted.pop().size;
                    }
                }

                return toRemove.concat(entriesSorted);
            })
            .then(entriesDepreciated => Promise.all(entriesDepreciated.map(entry => this.del(entry.key))));
    }
}
