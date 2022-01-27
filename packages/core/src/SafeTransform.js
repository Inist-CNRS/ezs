import { Transform } from 'readable-stream';

// extends Transform to pass error to the next stream in pipe
export default class SafeTransform extends Transform {
    pipe(stream) {
        this.on('error', (e) => stream.emit('error', e));
        return super.pipe(stream);
    }
}
