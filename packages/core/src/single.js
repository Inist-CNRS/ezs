import { PassThrough, Transform } from 'stream';
import { addedDiff } from 'deep-object-diff';

export default class Once extends Transform {
    constructor(ezs, mixed, options) {
        super(ezs.objectMode());
        this.first = true;
        this.tubin = new PassThrough(ezs.objectMode());
        this.tubout = this.tubin;
        if (Array.isArray(mixed)) {
            this.tubout = mixed.reduce(ezs.command, this.tubout);
        } else if (typeof mixed === 'string') {
            this.tubout = this.tubin.pipe(ezs(mixed, options));
        }
        this.on('finish', () => {
            this.tubin.end();
        });
        this.on('close', () => {
            this.tubin.close();
        });
        this.tubout.pause();
        this.result = null;
        this.addedResult = null;
    }

    _transform(chunk, encoding, callback) {
        if (this.first === true) {
            const oldChunk = Object.assign({}, chunk);
            this.first = false;
            this.tubout.on('data', (chunk2) => {
                if (typeof chunk2 === 'object') {
                    if (!this.result) {
                        this.result = {};
                    }
                    this.result = Object.assign(this.result, chunk2);
                } else {
                    if (!this.result) {
                        this.result = '';
                    }
                    this.result += chunk2;
                }
            })
            .on('end', () => {
                this.addedResult = addedDiff(oldChunk, this.result);
                callback(null, Object.assign(chunk, this.addedResult));
            });
            this.tubout.resume();
            this.tubin.write(chunk, encoding, () => {
                this.tubin.end();
            });
        } else {
            callback(null, Object.assign(chunk, this.addedResult));
        }
    }

}
