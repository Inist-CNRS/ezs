import { Transform } from 'stream';

export default class Catcher extends Transform {
    constructor(func) {
        super({
            writableObjectMode: true,
            readableObjectMode: true,
        });
        this.func = typeof func === 'function' ? func : (e => e);
    }

    _transform(chunk, encoding, done) {
        if (chunk instanceof Error) {
            if (typeof this.func === 'function') {
                const e = this.func(chunk);
                if (e instanceof Error) {
                    this.emit('error', e);
                }
            }
        } else if (chunk === null) {
            this.push(null);
        } else {
            this.push(chunk);
        }
        done();
    }
}
