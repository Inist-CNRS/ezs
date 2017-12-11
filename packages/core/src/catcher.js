import { Transform } from 'stream';

export default class Catcher extends Transform {
    constructor(func) {
        super({
            writableObjectMode: true,
            readableObjectMode: true,
        });
        this.func = func;
    }

    _transform(chunk, encoding, done) {
        if (chunk instanceof Error) {
            if (typeof this.func === 'function') {
                this.func(chunk);
            }
        } else if (chunk === null) {
            this.push(null);
        } else {
            this.push(chunk);
        }
        done();
    }
}
