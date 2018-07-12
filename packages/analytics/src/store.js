import fs from 'fs';
import levelup from 'levelup';
import leveldown from 'leveldown';
import tmpFilepath from 'tmp-filepath';
import ezs from 'ezs';

const encodeKey = (k) => JSON.stringify(k).split(' ').join('~');
const decodeKey = (k) => JSON.parse(String(k).split('~').join(' '));

const encodeValue = (k) => JSON.stringify(k);
const decodeValue = (k) => JSON.parse(String(k));


function decode(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    feed.send(decodeValue(data.value));
}


export default class Store  {

    constructor (source) {
        this.file = tmpFilepath(`.${source}`);
        this.db = levelup(leveldown(this.file));
    }

    get(key) {
        return this.db.get(encodeKey(key));
    }

    put(key, value) {
        return this.db.put(
            encodeKey(key), 
            encodeValue(value)
        );
    }

    cast(opt) {
        return this.db.createReadStream(opt).on('end', () => this.close()).pipe(ezs(decode));
    }

    close() {
        return this.db.close();
    }

}
