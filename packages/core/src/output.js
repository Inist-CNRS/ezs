import SafeTransform from './SafeTransform';

export default class Output extends SafeTransform {
    constructor(options) {
        super({
            ...options,
            writableObjectMode: true,
            readableObjectMode: false,
        });
    }

    _transform(chunk, encoding, done) {
        if (Buffer.isBuffer(chunk)) {
            this.push(chunk);
        } else if (typeof chunk === 'object') {
            this.push(Buffer.from(chunk.toString()));
        } else if (typeof chunk === 'number') {
            this.push(Buffer.from(chunk.toString()));
        } else if (chunk === null) {
            this.push(null);
        } else {
            this.push(Buffer.from(chunk));
        }
        done();
    }
}
