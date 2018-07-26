import assert from 'assert';
import { PassThrough, Duplex } from 'stream';
import { DEBUG, M_NORMAL } from './constants';

export default class Pipeline extends Duplex {
    constructor(ezs, commands) {
        super(ezs.objectMode());
        this.tubin = new PassThrough(ezs.objectMode());
        this.tubout = this.tubin;
        assert(Array.isArray(commands), 'Pipeline works with an array of commands.');
        const cmds = [...commands];
        cmds.push({
            mode: M_NORMAL,
            name: 'transit',
            args: { },
        });
        this.tubout = cmds.reduce(ezs.command, this.tubout);

        this.on('finish', () => {
            this.tubin.end();
        });
        this.tubout.on('data', (chunk, encoding) => {
            this.push(chunk, encoding);
        });
        this.tubout.on('finish', () => {
            this.push(null);
        });
        this.tubin.on('error', (e) => {
            DEBUG('Unlikely error on the Pipeline', e);
        });
        this.tubout.pause();
    }

    _write(chunk, encoding, callback) {
        this.tubin.write(chunk, encoding, callback);
    }

    _read(size) {
        this.lastSize = size;
        if (this.tubout.isPaused()) {
            this.tubout.resume();
        }
    }

}
