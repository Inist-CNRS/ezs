const assert = require('assert');
const from = require('from');
const ezs = require('ezs');

ezs.use(require('../lib'));

describe('test', () => {
    it('ISTEXSearch #1', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', { limit: 3 }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                assert(result[0]);
                assert(typeof result[0] === 'object');
                assert(typeof result[1] === 'string');
                done();
            });
    });
    it('ISTEXSearch #2', (done) => {
        const result = [];
        from([
            {
                q: 'this is an test',
            },
        ])
            .pipe(ezs('ISTEXSearch', { source: 'q', limit: 3 }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                assert(result[0]);
                assert(typeof result[0] === 'object');
                assert(typeof result[1] === 'string');
                done();
            });
    });
    it('ISTEXSearch #3', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', { target: 'istex', limit: 3 }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                assert(result[0]);
                assert(typeof result[0].istex === 'object');
                assert(typeof result[1].istex === 'string');
                done();
            });
    });
    it('ISTEXScroll #1', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', { limit: 2 }))
            .pipe(ezs('ISTEXScroll'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(typeof result[0] === 'object');
                assert(typeof result[1] === 'object');
                done();
            });
    }).timeout(3000);
    it('ISTEXScroll #2', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', { target: 'istex', limit: 2 }))
            .pipe(ezs('ISTEXScroll', { source: 'istex', target: 'istex' }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(typeof result[0].istex === 'object');
                assert(typeof result[1].istex === 'object');
                done();
            });
    }).timeout(3000);

    it('ISTEXResult #1', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', { limit: 2 }))
            .pipe(ezs('ISTEXScroll'))
            .pipe(ezs('ISTEXResult'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 4000);
                assert.equal(result[0].id.length, 40);
                assert.equal(result[1000].id.length, 40);
                assert.equal(result[3500].id.length, 40);
                done();
            });
    }).timeout(3000);
    it('ISTEXResult #2', (done) => {
        const result = [];
        from([
            {
                mark: 'azerty',
                istex: 'this is an test',
            },
        ])
            .pipe(ezs('ISTEXSearch', { source: 'istex', target: 'istex', limit: 2 }))
            .pipe(ezs('ISTEXScroll', { source: 'istex', target: 'istex' }))
            .pipe(ezs('ISTEXResult', { source: 'istex', target: 'istex' }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 4000);
                assert.equal(result[0].mark, 'azerty');
                assert.equal(result[0].istex.id.length, 40);
                assert.equal(result[1000].istex.id.length, 40);
                assert.equal(result[3500].istex.id.length, 40);
                done();
            });
    }).timeout(3000);
});
