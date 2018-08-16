import { DEBUG, PORT } from './constants';
import { Writable, Readable } from 'stream';


export class Reader extends Readable {
    constructor(ezs, path, options) {
        super(ezs.bytesMode());
    }

    _read(size) {
    }
}

export class Writer extends Writable {
    constructor(ezs, path, options) {
        super(ezs.bytesMode());
    }

    _write(chunk, encoding, callback) {
    }
}
