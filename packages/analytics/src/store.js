import levelup from 'levelup';
import leveldown from 'leveldown';
import tmpFilepath from 'tmp-filepath';
import core from './core';

const encodeKey = (k) => JSON.stringify(k).split(' ').join('~');
const decodeKey = (k) => JSON.parse(String(k).split('~').join(' '));

const encodeValue = (k) => JSON.stringify(k);
const decodeValue = (k) => JSON.parse(String(k));


function decode(data, feed) {
    if (this.isLast()) {
        feed.close(); return;
    }
    const k = decodeKey(data.key);
    const v = decodeValue(data.value);
    feed.send(core(k, v));
}


export default class Store {
    constructor(ezs, source) {
        this.file = tmpFilepath(`.${source}`);
        this.db = levelup(leveldown(this.file));
        this.ezs = ezs;
    }

    get(key) {
        return this.db.get(encodeKey(key)).then((val) => new Promise((resolve) => resolve(decodeValue(val))));
    }

    set(key, value) {
        return this.put(key, value);
    }

    put(key, value) {
        return this.db.put(
            encodeKey(key),
            encodeValue(value),
        );
    }

    add(key, value) {
        return this.get(key)
            .then((val) => this.put(key, val.concat(value)))
            .catch(() => this.put(key, [value]));
    }


    cast(opt) {
        return this.db.createReadStream(opt)
            .on('end', () => this.close())
            .pipe(this.ezs(decode));
    }

    close() {
        return this.db.close();
    }
}
