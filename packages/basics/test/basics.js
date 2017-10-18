const assert = require('assert');
const from = require('from');
const ezs = require('ezs');

ezs.use(require('../lib'));

describe('test', () => {
    it('JSONString #1', (done) => {
        from([
            {
                a: 1,
            },
            {
                b: 2,
            },
        ])
            .pipe(ezs('JSONString'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'string');
            })
            .on('end', () => {
                done();
            });
    });
    /*
    it('URLGet #1', (done) => {
        let c = 0;
        from([
            {
                a: 1,
                u: 'https://registry.npmjs.org/ezs',
            },
            {
                a: 2,
                u: 'https://registry.npmjs.org/ezs-basics',
            },
        ])
            .pipe(ezs('URLGet', {
                source: 'u',
                target: 'v',
            }))
            .on('data', (chunk) => {
                c += 1;
                if (c === 1) {
                    assert(chunk.v.name === 'ezs');
                }
                if (c === 2) {
                    assert(chunk.v.name === 'ezs-basics');
                }
            })
            .on('end', () => {
                done();
            });
    });
    */
});
