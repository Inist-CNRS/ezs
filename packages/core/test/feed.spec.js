import { PassThrough, Readable } from 'stream';
import ezs from '../src';

ezs.use({
    feedSpecSource(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        let i = 0;
        return feed.flow(new Readable({
            objectMode: true,
            read() {
                i += 1;
                this.push({ i });
            },
        }));
    },
    feedSpecFail(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        return feed.stop(new Error('other side closed'));
    },
});

describe('feed', () => {
    const { timeout } = ezs.settings.feed;
    beforeEach(() => { ezs.settings.feed.timeout = 300; });
    afterEach(() => { ezs.settings.feed.timeout = timeout; });

    it('does not throw when an abandoned flow times out after a failure downstream', (done) => {
        const handled = [];
        const input = new PassThrough({ objectMode: true });
        input
            .pipe(ezs('delegate', { script: '[feedSpecSource]\n[feedSpecFail]\n' }))
            .on('data', () => true)
            .on('error', (e) => handled.push(e.message));
        input.end({});
        setTimeout(() => {
            try {
                expect(handled).toHaveLength(1);
                expect(handled[0]).toEqual(expect.stringContaining('other side closed'));
                done();
            } catch (e) {
                done(e);
            }
        }, 1500);
    });
});
