import { Transform } from 'stream';

// extends Transform to pass error to the next stream in pipe
export default class Engine extends Transform {
    pipe(stream) {
        this.on('error', e => stream.emit('error', e));
        return super.pipe(stream);
    }
}
