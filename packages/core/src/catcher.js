import SafeTransform from './SafeTransform';

export default class Catcher extends SafeTransform {
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
        } else {
            this.push(chunk);
        }
        done();
    }
}
