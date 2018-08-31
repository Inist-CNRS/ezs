import path from 'path';
import fs from 'fs';
import { DEBUG, PORT } from './constants';
import { Writable, Readable } from 'stream';


export class Reader extends Readable {
    constructor(ezs, dirpath, options) {
        super(ezs.objectMode());

        this.lastIndex = 0;
        this.handles = Array(1);

        this.handles = Array(1).fill(true).map((value, index) => {
            const filepath = path.resolve(dirpath, `./${index}.bin`);
            return fs.createReadStream(filepath)
                .pipe(ezs.uncompress())
                .pipe(ezs('unpack'))
            ;
        });
    }

    _read(size) {
        if (this.handles.length <= 0) {
            return this.push(null);
        }
        this.lastIndex += 1;
        if (this.lastIndex >= this.handles.length) {
            this.lastIndex = 0;
        }
        const data = this.handles[this.lastIndex].read(size);
        if (data !== null) {
            this.push(data);
        } else {
            this.handles[this.lastIndex].destroy();
            this.handles = this.handles.filter((v, i) => i === this.lastIndex);
            this._read(size);
        }
    }


}

export class Writer extends Writable {
    constructor(ezs, dirpath, options) {
        super(ezs.objectMode());
        this.lastIndex = 0;

        fs.mkdirSync(dirpath);
        this.handles = Array(1).fill(true).map((value, index) => {
            const filepath = path.resolve(dirpath, `./${index}.bin`);
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
