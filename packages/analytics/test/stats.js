const assert = require('assert');
const from = require('from');
const ezs = require('../../core/src');

ezs.use(require('../src'));

describe('stats', () => {
    it('of 2 array', (done) => {
        const script = `
            [stats]
            path = a

            [exchange]
            value = env('stats')
            [debug]
        `;

        const env = {};
        const res = [];
        from([
            {
                a: 1,
            },
            {
                a: 1,
            },
            {
                a: 1,
            },
            {
                a: 1,
            },
            {
                a: 1,
            },
        ])
            .pipe(ezs('delegate', { script }, env))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                const stats = res.shift();
                console.log(env);
                expect(stats.sum).toEqual(4);
                done();
            });
    });
});
