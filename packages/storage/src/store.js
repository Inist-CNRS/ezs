import loki from 'lokijs';
import lfsa from 'lokijs/src/loki-fs-structured-adapter';
import from from 'from';

import { tmpdir } from 'os';
import { join } from 'path';
import pathExists from 'path-exists';
import makeDir from 'make-dir';

class AbstractStore {
    constructor(ezs, path) {
        this.ezs = ezs;

        const collectionOptions = {
            unique: ['key']
        }
        const adapter = new lfsa();
        this.db = new loki(`${path}/store.db`, {
            adapter: adapter,
            autoload: true,
            autoloadCallback: () => {
                const handle = this.db.getCollection('store');
                if (handle === null) {
                    this.db.addCollection('store', collectionOptions);
                }
            },
            autosave: true,
            autosaveInterval: 4000
        });
        this.handle = this.db.addCollection('store', collectionOptions);
    }

    async get(rawKey) {
        const key = JSON.stringify(rawKey);
        const result = this.handle.by('key', key);
        return result.value;
    }

    async put(rawKey, value, score = 1) {
        const key = JSON.stringify(rawKey);
        const existingDoc = this.handle.by('key', key);
        if (!existingDoc) {
            this.handle.insert({key, value, score});
        } else if (existingDoc.score <= score) {
            existingDoc.value = value;
            existingDoc.score = score;
            this.handle.update(existingDoc);
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
        return from(this.handle.find({})).pipe(this.ezs((data, feed, ctx) => {
            if (ctx.isLast()) {
                return feed.close();
            }
            return feed.send({
                id: JSON.parse(data.key),
                value: data.value,
            });
        }));
    }

    async reset() {
        return this.handle.findAndRemove({});
    }

    close() {
        this.db.close();
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
