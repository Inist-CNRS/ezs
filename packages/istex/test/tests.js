const assert = require('assert');
const from = require('from');
const ezs = require('ezs');

ezs.use(require('../lib'));

describe('test', () => {
    it('ISTEX #0', (done) => {
        const result = [];
        from([1, 2])
            .pipe(ezs('ISTEX', {
                query: 'this is an test',
                size: 3,
                maxPage: 1,
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 6);
                assert(result[0]);
                assert.equal(result[0].id, result[3].id);
                done();
            });
    }).timeout(5000);


    it('ISTEXFetch #0', (done) => {
        const result = [];
        from([
            {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
            },
            {
                id: 'ark:/67375/QHD-T00H6VNF-0',
            },

        ])
            .pipe(ezs('ISTEXFetch', {
                source: 'id',
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0]);
                assert.equal(result[0].id, '87699D0C20258C18259DED2A5E63B9A50F3B3363');
                assert.equal(result[1].ark[0], 'ark:/67375/QHD-T00H6VNF-0');
                done();
            });
    }).timeout(5000);

    it('ISTEXFetch #1', (done) => {
        const result = [];
        from([
            {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
            },
            {
                id: 'ark:/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            },

        ])
            .pipe(ezs('ISTEXFetch', {
                source: 'id',
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0]);
                assert.equal(result[0].id, '87699D0C20258C18259DED2A5E63B9A50F3B3363');
                assert(result[1] instanceof Error);
                done();
            });
    }).timeout(5000);

    it('ISTEXSearch #0', (done) => {
        const result = [];
        from([
            {
                _id: 1,
            },
        ])
            .pipe(ezs('ISTEXSearch', {
                query: 'this is an test',
                maxPage: 3,
                target: 'value',
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                assert(result[0]);
                assert(typeof result[0].value === 'object');
                assert(typeof result[1].value === 'string');
                done();
            });
    }).timeout(5000);

    it('ISTEXSearch #1', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', {
                maxPage: 3,
                sid: 'test',
            }))
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
    }).timeout(5000);

    it('ISTEXSearch #2', (done) => {
        const result = [];
        from([
            {
                q: 'this is an test',
            },
        ])
            .pipe(ezs('ISTEXSearch', {
                source: 'q',
                maxPage: 3,
                sid: 'test',
            }))
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
    }).timeout(5000);

    it('ISTEXSearch #3', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', {
                target: 'istex',
                maxPage: 3,
                sid: 'test',
            }))
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
    }).timeout(5000);

    it('ISTEXScroll #1', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', {
                maxPage: 2,
                sid: 'test',
            }))
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
    }).timeout(5000);

    it('ISTEXScroll #2', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', {
                target: 'istex',
                maxPage: 2,
                sid: 'test',
            }))
            .pipe(ezs('ISTEXScroll', {
                source: 'istex',
                target: 'istex',
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(typeof result[0].istex === 'object');
                assert(typeof result[1].istex === 'object');
                done();
            });
    }).timeout(5000);

    it('ISTEXResult #1', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', {
                maxPage: 2,
                sid: 'test',
            }))
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
    }).timeout(5000);

    it('ISTEXResult #2', (done) => {
        const result = [];
        from([
            {
                mark: 'azerty',
                istex: 'this is an test',
            },
        ])
            .pipe(ezs('ISTEXSearch', {
                source: 'istex',
                target: 'istex',
                maxPage: 2,
                sid: 'test',
            }))
            .pipe(ezs('ISTEXScroll', {
                source: 'istex',
                target: 'istex',
                sid: 'test',
            }))
            .pipe(ezs('ISTEXResult', {
                source: 'istex',
                target: 'istex',
                sid: 'test',
            }))
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
    }).timeout(5000);
});
