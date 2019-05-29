import { PassThrough } from 'stream';
import getLastCharacteristic from '../src/getLastCharacteristic';

class Feed extends PassThrough {
    constructor() {
        super({ objectMode: true });
        this.feed = {};
    }

    send(data) {
        this.write(data);
        this.end();
    }
}

describe('filterVersions', () => {
    it('should return the last Characteristic', (done) => {
        const feed = new Feed();

        getLastCharacteristic(
            [1, 2, 3],
            feed,
        );

        feed.on('data', (data) => {
            expect(data).toEqual(3);
            done();
        });

        feed.on('error', (e) => {
            done(e);
        });
    });
});
