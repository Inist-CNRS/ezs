import { tmpdir } from 'os';
import { join } from 'path';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import cacache from 'cacache';

class AbstractStore {
    constructor(ezs, handle) {
        this.ezs = ezs;
        this.handle = handle;
    }

    get(key) {
        const k = JSON.stringify(key);
        return cacache.get(this.handle, k).then(({ data }) => JSON.parse(String(data)));
    }

    put(key, value) {
        const k = JSON.stringify(key);
        return cacache.put(this.handle, k, JSON.stringify(value));
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
