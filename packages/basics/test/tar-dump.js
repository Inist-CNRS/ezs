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

    it('should dump and extract few objects with manifest', (done) => {
        const result = [];
        const script = `
        [TARDump]
        compress = true
        manifest = fix({ title: 'example', description: 'none'})
        manifest = fix({ version: '1.0'})
        manifest = fix(1)

        [TARExtract]
        compress = true
        path = manifest.json
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (obj) => {
                assert.equal(obj.description, 'none');
                assert.equal(obj.version, '1.0');
                assert.equal(obj.itemsCounter, 3);
                result.push(obj);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                done();
            });
    });

    it('should dump and extract text', (done) => {
        const result = [];
        const script = `
        [exchange]
        value = get('c')
        [TARDump]
        json = false
        extension = txt

        [TARExtract]
        path = **/*.txt
        json = false

        [exchange]
        value = get('value')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (obj) => {
                result.push(obj);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                assert.equal(result[0], 'un');
                assert.equal(result[1], 'deux');
                assert.equal(result[2], 'trois');
                done();
            });
    });



    it('should dump and extract additionalFiles (1)', (done) => {
        const result = [];
        const script = `
        [TARDump]
        json = true
        extension = json
        additionalFile = ${__dirname}/transit.ini

        [TARExtract]
        path = **/*.ini
        json = false

        [exchange]
        value = get('value')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (obj) => {
                result.push(obj);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert.match(result[0], /\[transit\]/);
                done();
            });
    });

    it('should dump and extract additionalFiles (2)', (done) => {
        const result = [];
        const script = `
        [TARDump]
        json = true
        extension = json
        additionalFile = ${__dirname}/transit.ini
        additionalFile = ${__dirname}/tocsv.ini

        [TARExtract]
        path = **/*.ini
        json = false

        [exchange]
        value = get('value')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (obj) => {
                result.push(obj);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert.notEqual(result[0], result[1]);
                assert.match(result[0], /\[transit\]/);
                assert.match(result[1], /\[transit\]/);
                done();
            });
    });


    it('should dump wrong additionalFiles', (done) => {
        const result = [];
        const script = `
        [TARDump]
        json = true
        extension = json
        additionalFile = ${__dirname}/transit.ini
        additionalFile = ${__dirname}/toto.ini
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('no such file or directory'));
                done();
            })
            .on('data', () => true)
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
});
