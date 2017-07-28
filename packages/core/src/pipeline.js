import { PassThrough, Duplex } from 'stream';

const reducer = ezs => (stream, command) => stream.pipe(ezs(command.name, command.args));

export default class Pipeline extends Duplex {
    constructor(ezs, commands, options) {
        super({ ...options, objectMode: true });
        this.tubin = new PassThrough({ objectMode: true });
        this.tubout = this.tubin;
        if (Array.isArray(commands)) {
            this.tubout = commands.reduce(reducer(ezs), this.tubout);
        }
        this.on('finish', () => {
            this.tubin.end();
        });
        this.on('close', () => {
            this.tubin.close();
        });
        this.tubout.on('data', (chunk, encoding) => {
            this.push(chunk, encoding);
        });
        this.tubout.on('finish', () => {
            this.push(null);
        });
        this.tubin.on('error', (e) => {
            console.error('Unlikely error', e);
        });
        this.tubout.pause();
    }

    _write(chunk, encoding, callback) {
        this.tubin.write(chunk, encoding, callback);
    }

    _read(size) {
        this.lastSize = size;
        this.tubout.resume();
    }

}

