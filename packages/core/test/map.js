import assert from 'assert';
import from from 'from';
import ezs from '../src';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;


describe('map', () => {
    test('simple statements', (done) => {
        const res = [];
        const script = `
            [assign]
            path = u
            value = 1
        `;
        const input = [
            { a: 1, b: [ { t: 'a' }, { t: 'b' } ] },
            { a: 2, b: [ { t: 'c' }, { t: 'd' } ] },
            { a: 3, b: [ { t: 'e' }, { t: 'f' } ] },
            { a: 4, b: [ { t: 'g' }, { t: 'h' } ] },
            { a: 5, b: [ { t: 'i' }, { t: 'j' } ] },
        ];
        from(input)
            .pipe(ezs('map', {
                path:  'b',
                script,
            }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal(1, res[0].b[0].u);
                assert.equal(1, res[0].b[1].u);
                assert.equal(1, res[1].b[0].u);
                assert.equal(1, res[1].b[1].u);
                done();
            });
    });

    test('nested statements', (done) => {
        const res = [];
        const script = `
            [map]
            path = b
            [map/map]
            path = t
            [map/map/exchange]
            value = self().append('!')
        `;
        const input = [
            { a: 1, b: [ { t: ['a'] }, { t: ['a', 'b'] } ] },
            { a: 2, b: [ { t: ['c'] }, { t: ['c', 'd'] } ] },
            { a: 3, b: [ { t: ['e'] }, { t: ['e', 'f'] } ] },
            { a: 4, b: [ { t: ['g'] }, { t: ['h'] } ] },
            { a: 5, b: [ { t: ['i'] }, { t: ['j'] } ] },
        ];
        from(input)
            .pipe(ezs('delegate', { script }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal('a!', res[0].b[0].t[0]);
                assert.equal('b!', res[0].b[1].t[1]);
                assert.equal('c!', res[1].b[0].t[0]);
                assert.equal('d!', res[1].b[1].t[1]);
                done();
            });
    });

    test('nested slow statements', (done) => {
        const res = [];
        const script = `
            [map]
            path = b
            [map/map]
            path = t
            [map/map/throttle]
            milliseconds = 2000

            [map/map/exchange]
            value = self().append('!')
        `;
        const input = [
            { a: 1, b: [ { t: ['a'] }, { t: ['a', 'b'] } ] },
            { a: 2, b: [ { t: ['c'] }, { t: ['c', 'd'] } ] },
            { a: 3, b: [ { t: ['e'] }, { t: ['e', 'f'] } ] },
            { a: 4, b: [ { t: ['g'] }, { t: ['h'] } ] },
            { a: 5, b: [ { t: ['i'] }, { t: ['j'] } ] },
        ];
        from(input)
            .pipe(ezs('delegate', { script }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal('a!', res[0].b[0].t[0]);
                assert.equal('b!', res[0].b[1].t[1]);
                assert.equal('c!', res[1].b[0].t[0]);
                assert.equal('d!', res[1].b[1].t[1]);
                done();
            });
    }, 30000);

});


