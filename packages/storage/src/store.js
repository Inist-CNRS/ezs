import { tmpdir } from 'os';
import { join } from 'path';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import LRU from 'lru-cache';
import cacache from 'cacache';

class AbstractStore {
    constructor(ezs, handle) {
        this.ezs = ezs;
        this.handle = handle;
        if (ezs.settings.cacheEnable) {
            this.cache = new LRU(ezs.settings.cache);
        } else {
            this.cache = false;
        }
    }

    get(key) {
        const k = JSON.stringify(key);
        const o = { memoize: this.cache };
        return cacache.get(this.handle, k, o).then(({ data }) => JSON.parse(String(data)));
    }

    async put(key, value, score) {
        const k = JSON.stringify(key);
        const v = JSON.stringify(value);
        if (!score) {
            return cacache.put(this.handle, k, v);
        }
        const alreadyExist = await cacache.get.info(this.handle, k);
        if (!alreadyExist ||
            !alreadyExist.metadata ||
            !alreadyExist.metadata.score ||
            alreadyExist.metadata.score < score) {
            const o = {
                metadata: {
                    score,
                }
            };
            return cacache.put(this.handle, k, v, o);
        }
        return Promise.resolve(true);
    }

    stream() {
        return this.cast();
    }

    empty() {
        return this.cast().pipe(this.ezs(async (data, feed, ctx) => {
            if (ctx.isLast()) {
                await this.reset();
                return feed.close();
            }
            return feed.send(data);
        }));
    }

    cast() {
        return cacache.ls.stream(this.handle).pipe(this.ezs( async (data, feed, ctx) => {
            if (ctx.isLast()) {
                return feed.close();
            }
            const { key, integrity } = data;
            try {
                const value = await cacache.get.byDigest(this.handle, integrity);
                return feed.send({
                    id: JSON.parse(key),
                    value: JSON.parse(value),
                });
            }
            catch (e) {
                return feed.end();
            }
        }));
    }

    reset() {
        return cacache.rm.all(this.handle);
    }

    close() {
        delete this.handle;
        return Promise.resolve(true);
    }
}

export default async function store(ezs, domain, location) {

    const path = join(location || tmpdir(), 'db', domain);
    if (!pathExists.sync(path)) {
        makeDir.sync(path);
    }
    return new AbstractStore(ezs, path);
}
