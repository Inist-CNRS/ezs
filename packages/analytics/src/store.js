import fs from 'fs';
import levelup from 'levelup';
import leveldown from 'leveldown';
import tmpFilepath from 'tmp-filepath';
import ezs from 'ezs';
import core from './core';

const encodeKey = (k) => JSON.stringify(k).split(' ').join('~');
const decodeKey = (k) => JSON.parse(String(k).split('~').join(' '));

const encodeValue = (k) => JSON.stringify(k);
const decodeValue = (k) => JSON.parse(String(k));


function decode(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const k = decodeKey(data.key);
    const v = decodeValue(data.value);
    feed.send(core(k, v));
}


export default class Store  {

    constructor (source) {
        this.file = tmpFilepath(`.${source}`);
        this.db = levelup(leveldown(this.file));
    }

    get(key) {
        return this.db.get(encodeKey(key)).then(val => new Promise(resolve => resolve(decodeValue(val))));
    }

    set(key, value) {
        return this.put(key, value);
    }

    put(key, value) {
        return this.db.put(
            encodeKey(key),
            encodeValue(value)
        );
    }

    add(key, value) {
        return this.get(key).then(val => {
            return this.put(key, val.concat(value));
        }).catch((e) => {
            return this.put(key, [value]);
        })
    }


    cast(opt) {
        return this.db.createReadStream(opt).on('end', () => this.close()).pipe(ezs(decode));
    }

    close() {
        return this.db.close();
    }

}
