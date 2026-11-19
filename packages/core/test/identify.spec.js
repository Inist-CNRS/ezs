import assert from 'assert';
import { Readable } from 'stream';
import from from 'from';
import ezs from '../src';
import statements from '../src/statements';
import { ncda, validKey } from '../src/statements/identify';

ezs.use(statements);

const data = [
    { a: 1, b: 'a' },
    { a: 2, b: 'b' },
    { a: 3, b: 'c', uri: 'uid:/ezs-5KB8aAA4-p' },
    { a: 4, b: 'd' },
    { a: 5, b: 'e' },
    { a: 6, b: 'f', uri: 'uid:/ezs-V9neThkw-e' },
];

class Upto extends Readable {
    constructor(m) {
        super({ objectMode: true });
        this.i = -1;
        this.m = m;
    }

    _read() {
        this.i += 1;
        if (this.i >= this.m) {
            this.push(null);
        } else {
            this.push(this.i);
        }
    }
}

describe('[identify]', () => {
    it('with no uri #1', (done) => {
        const input = [...data];
        const output = [];
        from(input)
            .pipe(ezs('keep', { path: ['a', 'b'] }))
            .pipe(ezs('identify'))
            .pipe(ezs('extract', { path: 'uri' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].indexOf('uid:'), 0);
                done();
            });
    });
    it('with no uri #2', (done) => {
        const input = [...data];
        const output = [];
        from(input)
            .pipe(ezs('keep', { path: ['a', 'b'] }))
            .pipe(ezs('identify', { path: ['_id', 'id'] }))
            .pipe(ezs('extract', { path: '_id' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].indexOf('uid:'), 0);
                done();
            });
    });
    it('with no uri #3', (done) => {
        const input = [...data];
        const output = [];
        from(input)
            .pipe(ezs('keep', { path: ['a', 'b'] }))
            .pipe(ezs('identify', { scheme: 'toto' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].uri, undefined);
                done();
            });
    });
});

describe('identify (scheme sha)', () => {
    it('identify #1', (done) => {
        const res = [];
        from([
            { a: 'x', b: 3 },
            { a: 't', b: 2 },
            { a: 'toto:/abracadabra', b: 2 },
            { a: 'doi:/10.1111/j.1564-9121.2012.00150.x(ISSN)', b: 3 },
            { a: 'hal$hal-03517406~crossref$10.46298/lmcs-18(1:1)2022', b: 4 },
        ])
            .pipe(ezs('identify', { path: 'a', scheme: 'sha' }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 5);
                assert.notEqual(res[0].a, res[1].a);
                assert.equal(res[0].b, 3);
                assert.equal(res[1].b, 2);
                assert.equal(res[2].a, 'toto:/abracadabra');
                assert.equal(
                    res[3].a,
                    'doi:/10.1111/j.1564-9121.2012.00150.x(ISSN)'
                );
                assert.equal(res[0].a.split(':').shift(), 'sha');
                assert.equal(res[4].a.split(':').shift(), 'sha');
                done();
            });
    });
    it('identify 1bis', (done) => {
        const res = [];
        const script = `
[identify]
scheme = sha
content = get('b')
`;
        from([
            { a: 'a', b: 3 },
            { a: 'b', b: 2 },
            { a: 'c', b: 2 },
            { a: 'd', b: 3 },
        ])
            .pipe(ezs('delegate', { script }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 4);
                assert.notEqual(res[0].uri, res[1].uri);
                assert.notEqual(res[2].uri, res[3].uri);
                assert.equal(res[0].uri, res[3].uri);
                assert.equal(res[1].uri, res[2].uri);
                done();
            });
    });
    it('identify 1ter', (done) => {
        const res = [];
        const script = `
[identify]
scheme = sha
`;
        from([
            { a: 'a', b: 3 },
            { a: 'b', b: 2 },
            { a: 'c', b: 2 },
            { a: 'd', b: 3 },
        ])
            .pipe(ezs('delegate', { script }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 4);
                assert.notEqual(res[0].uri, res[1].uri);
                assert.notEqual(res[1].uri, res[2].uri);
                assert.notEqual(res[2].uri, res[3].uri);
                assert.notEqual(res[3].uri, res[0].uri);
                done();
            });
    });

    it('identify #2', (done) => {
        from([{ id: 1, b: 'a' }, undefined, { id: 1, b: 'a' }])
            .pipe(ezs('identify', { path: 'uuid', scheme: 'sha' }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                try {
                    expect(e.message).toEqual(
                        expect.stringContaining('Received undefined')
                    );
                    done();
                } catch (ee) {
                    done(ee);
                }
            })
            .on('data', () => true)
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    it('identify #3', (done) => {
        const script = `
[replace]
path = value
value = self()

[identify]
scheme = sha

[dedupe]
ignore = true
`;
        let counter = 0;
        const size = 1000000;
        const bcp = new Upto(size);
        bcp.pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            })
            .on('data', () => {
                counter += 1;
            })
            .on('end', () => {
                expect(counter).toBe(size);
                done();
            });
    }, 60000);
    it('identify #4', (done) => {
        const script = `
[replace]
path = value
value = self()

[identify]
scheme = sha
content = get('value')

[debug]

[dedupe]
ignore = true
`;
        let counter = 0;
        const size = 100;
        const bcp = new Upto(size);
        bcp.pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            })
            .on('data', () => {
                counter += 1;
            })
            .on('end', () => {
                expect(counter).toBe(size);
                done();
            });
    }, 60000);
});

describe('validKey', () => {
    test('with null', () => {
        expect(validKey()).toBe(false);
    });
    test('with blank', () => {
        expect(validKey('')).toBe(false);
    });
    test('with object', () => {
        expect(validKey({})).toBe(false);
    });
    test('with number', () => {
        expect(validKey(12345)).toBe(false);
    });
    test('with no slash', () => {
        expect(validKey('uid:XXX-YYYYYYYY-Z')).toBe(true);
    });
    test('with strange scheme', () => {
        expect(validKey('toto:/XXX-YYYYYYYY-Z')).toBe(true);
    });
    test('with no scheme', () => {
        expect(validKey('XXX-YYYYYYYY-Z')).toBe(false);
    });
    test('with uri', () => {
        expect(validKey('uid:/XXX')).toBe(true);
    });
    test('with ark', () => {
        expect(validKey('ark:/67375/6H6-05FM5LNG-3')).toBe(true);
    });
    test('with ark', () => {
        expect(validKey('un identifiant:1')).toBe(false);
    });
});

describe('ncda', () => {
    test('with null', () => {
        expect(ncda()).toBe('');
    });
    test('with null (bis)', () => {
        expect(ncda(null, ['a', 'b'])).toBe('');
    });
    test('with blank', () => {
        expect(ncda('')).toBe('');
    });
    test('with blank (bis)', () => {
        expect(ncda('', ['a', 'b'])).toBe('');
    });
    test('with object', () => {
        expect(ncda({})).toBe('');
    });
    test('with object (bis)', () => {
        expect(ncda({}, ['a', 'b'])).toBe('');
    });
    test('with string #1', () => {
        expect(ncda('12345', '12345')).toBe('1');
    });
    test('with string #2', () => {
        expect(ncda('345', '12345')).toBe('1');
    });
    test('with string #3', () => {
        expect(ncda('121212123', '12345')).toBe('4');
    });
    test('with string but no alphabet', () => {
        expect(ncda('12345')).toBe('');
    });
    test('with string no restricted alphabet', () => {
        expect(ncda('12345', '12')).toBe('1');
    });
    test('with string incompatible alphabet', () => {
        expect(ncda('12345', 'AB')).toBe('A');
    });
    test('with number and no alphabet', () => {
        expect(ncda(12345)).toBe('');
    });
    test('with number and special alphabet', () => {
        expect(ncda(12345, [1, 2, 3, 4, 5])).toBe('');
    });
    test('with number and special alphabet', () => {
        expect(ncda(121212123, [1, 2, 3, 4, 5])).toBe('');
    });
});
