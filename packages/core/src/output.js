import { Transform } from 'stream';

// we do not use SafeTranform,
// because Output should be used to send data to
// binary (system) stream , standard output, or to the browser
export default class Output extends Transform {
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
        } else if (typeof chunk === 'object' || typeof chunk === 'boolean') {
            this.push(Buffer.from(chunk.toString()));
        } else if (typeof chunk === 'number') {
            this.push(Buffer.from(chunk.toString()));
        } else if (!chunk) {
            this.push(null);
        } else {
            this.push(Buffer.from(chunk));
        }
        done();
    }
}
