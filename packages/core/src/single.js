import { PassThrough, Transform } from 'stream';

export default class Once extends Transform {
    constructor(ezs, mixed, options) {
        super({ objectMode: true });
        this.first = true;
        this.tubin = new PassThrough({ objectMode: true });
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
    }

    _transform(chunk, encoding, callback) {
        if (this.first === true) {
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
                const result = Object.assign(chunk, this.result);
                callback(null, result);
            });
            this.tubout.resume();
            this.tubin.write(chunk, encoding, () => {
                this.tubin.end();
            });
        } else {
            const result = Object.assign(chunk, this.result);
            callback(null, result);
        }
    }

}
