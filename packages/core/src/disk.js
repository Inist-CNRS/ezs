import path from 'path';
import fs from 'fs-extra';
import MultiStream from 'multistream';
import { DEBUG, PORT, NSHARDS } from './constants';
import { Writable, Readable } from 'stream';

export class Reader extends Readable {
    constructor(ezs, dirpath, options) {
        super(ezs.objectMode());

        // to avoid to use classic directory
        const savedir = dirpath.concat('.ezs');
        const streams = Array(NSHARDS).fill(true).map((value, index) => {
            const filepath = path.resolve(savedir, `./${index}.bin`);
            return fs.createReadStream(filepath)
                .pipe(ezs.uncompress())
                .pipe(ezs('unpack'))
            ;
        });
        this.tubout = new MultiStream.obj(streams)
            .pipe(ezs('transit'))
        ;
        this.tubout.on('data', (chunk, encoding) => {
             if (!this.push(chunk, encoding)) {
                 this.tubout.pause();
             }
        });
        this.tubout.on('finish', () => {
            this.push(null);
        });
        this.tubout.on('error', (e) => {
            DEBUG('Unlikely error', e);
        });
        this.tubout.pause();

    }

    _read(size) {
        if (this.tubout.isPaused()) {
            this.tubout.resume();
        }
    }

    _destroy(err, cb) {
        this.tubout.destroy();
        cb(err);
    }
}

export class Writer extends Writable {
    constructor(ezs, dirpath, options) {
        super(ezs.objectMode());
        this.lastIndex = 0;

        const savedir = dirpath.concat('.ezs');
        fs.emptyDirSync(savedir);
        this.handles = Array(NSHARDS).fill(true).map((value, index) => {
            const filepath = path.resolve(savedir, `./${index}.bin`);
            const input = [];
            input[0] = ezs.createStream(ezs.objectMode());
            input[1] = input[0].pipe(ezs('pack'))
                .pipe(ezs.toBuffer())
                .pipe(ezs.compress())
                .pipe(fs.createWriteStream(filepath));
            return input;
        });
    }

    _write(chunk, encoding, callback) {
        this.lastIndex += 1;
        if (this.lastIndex >= this.handles.length) {
            this.lastIndex = 0;
        }
        this.handles[this.lastIndex][0].write(
            chunk,
            encoding,
            callback,
        );
    }

    _final(callback) {
        const promesses = this.handles.map(s => new Promise(resolve => {
            if (s[0]) {
                s[0].end(() => resolve(true))
            } else {
                resolve(false);
            }
        }));
        Promise.all(promesses).then(flags => callback());
    }
}
