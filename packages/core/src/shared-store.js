import memored from 'memored';
import Store from './store.js';

export default class SharedStore extends Store {
    constructor() {
        super();
        memored.setup({
            purgeInterval: 15000,
        });
    }

    get(key) {
        return new Promise((resolve, reject) => {
            if (this.isEmpty(key)) {
                return reject(new Error('A undefined key cannot access to the store'));
            }
            return memored.read(key, (err, value) => {
                if (err) {
                    return reject(err);
                }
                return resolve(value);
            });
        });
    }

    set(key, value) {
        return new Promise((resolve, reject) => {
            if (this.isEmpty(key)) {
                return reject(new Error('A undefined key cannot access to the store'));
            }
            return memored.store(key, value, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve(value);
            });
        });
    }

    size() {
        return new Promise((resolve) => {
            memored.size((err, size) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(size);
                }
            });
        });
    }
}

