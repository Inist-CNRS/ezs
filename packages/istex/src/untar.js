import tar from 'tar-stream';
import { PassThrough } from 'stream';
import { createGunzip } from 'zlib';
import { writeTo } from './utils';

export default function ISTEXUntar(data, feed) {
    if (this.isFirst()) {
        this.input = new PassThrough();
        const extract= tar.extract();
        this.whenFinish = new Promise((resolve, reject) => {
            extract.on('entry', (headers, stream, next) => {
                if (headers.name === 'manifest.json') {
                    stream.resume();
                    next();

                } else if (headers.name.endsWith('.json')) {
                    let content = '';
                    stream.on('data', (chunk) => {
                        content += chunk.toString();
                    });

                    stream.on('end', () => {
                        feed.write(JSON.parse(content));
                        next();
                    });

                } else {
                    stream.resume();
                    next();
                }
            });
            extract.on('error', reject);
            extract.on('finish', resolve);
        });
        this.input.pipe(createGunzip()).pipe(extract);
    }

    if (this.isLast()) {
        this.whenFinish
            .then(() => feed.close())
            .catch((e) => feed.stop(e));
        this.input.end();
        return;
    }

    writeTo(this.input, data, () => feed.end());
}