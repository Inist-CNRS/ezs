export default class IsolatedStore {
    constructor() {
        this.store = {};
    }
    get(key) {
        return new Promise((resolve, reject) => {
            if (!key) {
                return reject(new Error('A undefined key cannot access to the store'));
            }
            return resolve(this.store[key]);
        });
    }
    set(key, value) {
        return new Promise((resolve, reject) => {
            if (!key) {
                return reject(new Error('A undefined key cannot access to the store'));
            }
            this.store[key] = value;
            return resolve(this.store[key]);
        });
    }
    all() {
        return new Promise(resolve => resolve(Object.keys(this.store)));
    }
}

