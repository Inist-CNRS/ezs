import assert from 'assert';
import from from 'from';
import ezs from '../src';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;

function func1(data, feed) {
    if (this.isLast()) {
        feed.close();
    }
    feed.write(JSON.parse(JSON.stringify(data)));
    feed.end();
}
function func2(data, feed) {
    if (this.isLast()) {
        feed.close();
    }
    feed.write(JSON.parse(JSON.stringify(data)));
    feed.write(JSON.parse(JSON.stringify(data)));
    feed.end();
}


describe('node16 through file(s)', () => {


    it('same object', (done) => {
        let res = 0;
        from([
            { a: 1, b: 1 },
        ])
            .pipe(ezs((d, f) => f.send(d)))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.b;
            })
            .on('end', () => {
                assert.equal(1, res);
                done();
            });
    });

    it('clone one object', (done) => {
        const strm = ezs(func1);
        let res = 0;
        from([
            { a: 1, b: 1 },
        ])
            .pipe(strm)
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.b;
            })
            .on('end', () => {
                assert.equal(1, res);
                done();
            });
    });

    it('all objects', (done) => {
        let res = 0;
        from([
            { a: 1, b: 1 },
            { a: 2, b: 1 },
            { a: 3, b: 1 },
            { a: 4, b: 1 },
            { a: 5, b: 1 },
        ])
            .pipe(ezs(func1))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.b;
            })
            .on('end', () => {
                assert.equal(5, res);
                done();
            });
    });
    it('clone all objects', (done) => {
        let res = 0;
        from([
            { a: 1, b: 1 },
            { a: 2, b: 1 },
            { a: 3, b: 1 },
            { a: 4, b: 1 },
            { a: 5, b: 1 },
        ])
            .pipe(ezs(func2, {
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.b;
            })
            .on('end', () => {
                assert.equal(10, res);
                done();
            });
    });
});
