import assert from 'assert';
import SafeTransform from './SafeTransform';


export default class Tag extends SafeTransform {
    constructor(tagname, func) {
        super({ objectMode: true });

        assert.equal(typeof tagname, 'string');
        assert.equal(typeof func, 'function');

        this.func = func;
        this.tagname = tagname;
    }

    transform(chunk, encoding, callback) {
        if (this.func(chunk)) {
            chunk.tagName = () => this.tagname;
        }
        callback(null, chunk);
    }
}
