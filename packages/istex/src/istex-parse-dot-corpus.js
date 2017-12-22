import { PassThrough } from 'stream';
import { writeTo } from './utils';

function ISTEXParseDotCorpus(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const metadata = this.ezs.metaString(data);
    const statement = this.ezs.fromString(data);
    const input = new PassThrough({ objectMode: true });
    const output = input
        .pipe(statement)
        .on('data', (chunk) => {
            feed.write({ ...metadata, ...chunk});
        })
        .on('error', (e) => {
            feed.write(e);
        })
        .on('end', () => {
            feed.end();
        });
    writeTo(input, metadata, () => input.end());
}


export default {
    ISTEXParseDotCorpus,
};
