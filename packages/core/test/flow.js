import assert from 'assert';
import from from 'from';
import ezs from '../src';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;

describe('flow stream in stream', () => {
    function flowtest(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        return feed.flow(from(Array(data).fill(true)));
    }
    function flowtestwithend(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        return feed.flow(from(Array(data).fill(true)), () => feed.end());
    }

    function flowtestwitherror(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        const arr = Array(data).fill(true);
        arr[3] = 7;
        return feed.flow(from(arr).pipe(this.ezs('plaf')));
    }

    it('with throttle', (done) => {
        let res = 0;
        from([
            1,
            10,
            100,
            1000,
        ])
            .pipe(ezs(flowtest))
            .pipe(ezs('throttle', { milliseconds: 1 }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', () => {
                res += 1;
            })
            .on('end', () => {
                assert.equal(1111, res);
                done();
            });
    }, 10000);
    it('without throttle', (done) => {
        let res = 0;
        from([
            1,
            10,
            100,
            1000,
        ])
            .pipe(ezs(flowtest))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', () => {
                res += 1;
            })
            .on('end', () => {
                assert.equal(1111, res);
                done();
            });
    }, 10000);
    it('with end func', (done) => {
        let res = 0;
        from([
            1,
            10,
            100,
            1000,
        ])
            .pipe(ezs(flowtestwithend))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', () => {
                res += 1;
            })
            .on('end', () => {
                assert.equal(1111, res);
                done();
            });
    }, 10000);

    it('with error', (done) => {
        let res = 0;
        from([
            1,
            10,
            100,
            1000,
        ])
            .pipe(ezs(flowtestwitherror))
            .pipe(ezs.catch())
            .on('error', (err) => {
                assert.ok(err instanceof Error);
                assert.equal(res, 1);
                done();
            })
            .on('data', () => {
                res += 1;
            })
            .on('end', () => {
                throw new Error('Error expected');
            });
    }, 10000);
    it('with error and throttle', (done) => {
        let res = 0;
        from([
            1,
            10,
            100,
            1000,
        ])
            .pipe(ezs(flowtestwitherror))
            .pipe(ezs.catch())
            .pipe(ezs('throttle', { milliseconds: 100 }))
            .on('error', (err) => {
                assert.ok(err instanceof Error);
                assert.equal(res, 0);
                done();
            })
            .on('data', () => {
                res += 1;
            })
            .on('end', () => {
                throw new Error('Error expected');
            });
    }, 10000);
});
