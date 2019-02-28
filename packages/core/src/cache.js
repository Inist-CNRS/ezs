import LRU from 'keyv-lru-files';
import path from 'path';
import mkdirp from 'mkdirp';

export default class Cache {
    constructor(options) {
        this.handle = new LRU(options);
        this.handle.opts.dir = path.format({
            root: options.root,
            name: options.dir,
        });
    }

    has(id) {
        return this.handle.has(id);
    }

    get(id) {
        return this.handle.stream(id);
    }

    clear() {
        return this.handle.clear();
    }

    del(id) {
        return this.handle.delete(id);
    }

    set(id, stream) {
        return new Promise((resolve, reject) => mkdirp(this.handle.opts.dir, (err) => {
            if (err) return reject(err);
            return resolve();
        })).then(() => this.handle.set(id, stream));
    }
}
