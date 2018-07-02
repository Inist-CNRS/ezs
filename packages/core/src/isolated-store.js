import Store from './store.js';

export default class IsolatedStore extends Store {
    constructor() {
        super();
        this.store = {};
    }

    get(key) {
        return new Promise((resolve, reject) => {
            if (this.isEmpty(key)) {
                return reject(new Error('A undefined key cannot access to the store'));
            }
            return resolve(this.store[key]);
        });
    }

    set(key, value) {
        return new Promise((resolve, reject) => {
            if (this.isEmpty(key)) {
                return reject(new Error('A undefined key cannot access to the store'));
            }
            this.store[key] = value;
            return resolve(this.store[key]);
        });
    }

    size() {
        return new Promise((resolve) => {
            resolve(this.store.length);
        });
    }
}

