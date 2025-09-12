import SafeTransform from './SafeTransform.js';

export default class Catcher extends SafeTransform {
    constructor(func) {
        super({
            writableObjectMode: true,
            readableObjectMode: true,
        });
        this.func = typeof func === 'function' ? func : ((e) => e);
    }

    _transform(chunk, encoding, done) {
        if (chunk instanceof Error) {
            if (typeof this.func === 'function') {
                const e = this.func(chunk);
                if (e instanceof Error) {
                    this.emit('error', e); // catch and stop
                } else if (e === false) {
                    this.push(chunk); // no catch
                } else if (e)  { // convert to standard data
                    this.push(e);
                }
            }
        } else {
            this.push(chunk); // no catch
        }
        done();
    }
}
