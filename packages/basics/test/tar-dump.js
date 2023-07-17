const assert = require('assert');
const from = require('from');
const ezs = require('../../core/src');

ezs.use(require('../src'));

describe('TARDump', () => {
    const input = [
        { a: 1, b: true, c: 'un' },
        { a: 2, b: true, c: 'deux' },
        { a: 3, b: true, c: 'trois' },
    ];
    it('should dump and extract few objects (tmpfile)', (done) => {
        const result = [];
        const script = `
        [TARDump]

        [FILESave]
        identifier = test-a.tar
        location = /tmp

        [exchange]
        value = get('filename')

        [FILELoad]
        location = /tmp

        [TARExtract]
        path = data/*.json
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (obj) => {
                assert.equal(obj.b, true);
                result.push(obj);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                done();
            });
    });

    it('should dump and extract few objects (stream)', (done) => {
        const result = [];
        const script = `
        [TARDump]

        [TARExtract]
        path = data/*.json
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (obj) => {
                assert.equal(obj.b, true);
                result.push(obj);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                done();
            });
    });

    it('should dump and extract few objects (stream & custom path)', (done) => {
        const result = [];
        const script = `
        [TARDump]
        location = another/pathname

        [TARExtract]
        path = another/pathname/*.json
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (obj) => {
                assert.equal(obj.b, true);
                result.push(obj);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                done();
            });
    });

    it('should dump and extract few objects (stream & compress)', (done) => {
        const result = [];
        const script = `
        [TARDump]
        compress = true

        [TARExtract]
        compress = true
        path = data/*.json
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (obj) => {
                assert.equal(obj.b, true);
                result.push(obj);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                done();
            });
    });



});
