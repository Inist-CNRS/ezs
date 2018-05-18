import memored from 'memored';

export default class SharedStore {
    constructor() {
        memored.setup({
            purgeInterval: 15000,
        });
    }
    get(key) {
        return new Promise((resolve, reject) => {
            if (!key) {
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
            if (!key) {
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
    all() {
        return new Promise((resolve, reject) => memored.keys((err, value) => {
            if (err) {
                return reject(err);
            }
            return resolve(value);
        }));
    }
}

