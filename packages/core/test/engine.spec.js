import assert from 'assert';
import from from 'from';
import Expression from '../src/expression';
import ezs from '../src';


ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;

beforeAll(() => {
    ezs.settings.cacheEnable = true;
});
afterAll(() => {
    ezs.settings.cacheEnable = false;
});

describe('ad hoc statement', () => {
    const input = [
        { a: 1, b: 9 },
        { a: 2, b: 9 },
        { a: 3, b: 9 },
        { a: 4, b: 9 },
        { a: 5, b: 9 },
    ];
    it('with function', (done) => {
        function adhoc1(data, feed) {
            if (this.isLast()) {
                return feed.close();
            }
            if (this.isFirst()) {
                this.counter = 12;
            }
            this.counter += 2;
            const somme = this.getIndex() - data.a + this.counter + this.getParam('state1') + this.getEnv('state2');
            return feed.send(somme);
        }
        let res = 0;
        from(input)
            .pipe(ezs(adhoc1, { state1: 10 }, { state2: 20 } ))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.equal(240, res);
                done();
            });
    });
    it('with arrow', (done) => {
        const adhoc2 = (data, feed, ctx) => {
            if (ctx.isLast()) {
                return feed.close();
            }
            if (ctx.isFirst()) {
                ctx.counter = 12;
            }
            ctx.counter += 2;
            const somme = ctx.getIndex() - data.a + ctx.counter + ctx.getParam('state1') + ctx.getEnv('state2');
            return feed.send(somme);
        };
        let res = 0;
        from(input)
            .pipe(ezs(adhoc2, { state1: 10 }, { state2: 20 } ))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.equal(240, res);
                done();
            });
    });
});
