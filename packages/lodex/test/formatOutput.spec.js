import from from 'from';
import ezs from '../../core/src';
import ezsLodex from '../src';

ezs.use(ezsLodex);

describe('formatOutput', () => {
    it('should work without param', (done) => {
        let res = '';
        from([{ a: 1, b: 2 }, { a: 3, b: 4 }])
            .pipe(ezs('LodexOutput'))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                expect(res).toHaveLength(40);
                expect(res).toBe('{"data":[{"a":1,"b":2},\n{"a":3,"b":4}]}\n');
                done();
            });
    });

    it('should indent output when asked', (done) => {
        let res = '';
        from([{ a: 1, b: 2 }, { a: 3, b: 4 }])
            .pipe(ezs('LodexOutput', { indent: true }))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                expect(res).toHaveLength(66);
                expect(res).toBe('{"data":[{\n    "a": 1,\n    "b": 2\n},\n{\n    "a": 3,\n    "b": 4\n}]}\n');
                done();
            });
    });

    it('should extract a property from objects', (done) => {
        let res = '';
        from([
            { a: 1, b: 2, t: 3 },
            { a: 4, b: 5, t: 6 },
        ])
            .pipe(ezs('LodexOutput', { extract: 't' }))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                const json = JSON.parse(res);
                expect(json).toEqual({
                    data: [
                        { a: 1, b: 2 },
                        { a: 4, b: 5 },
                    ],
                    t: 3,
                });
                done();
            });
    });

    it('should use keyName', (done) => {
        let res = '';
        from([
            { a: 1, b: 2 },
            { a: 3, b: 4 },
        ])
            .pipe(ezs('LodexOutput', { keyName: 'chuck' }))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                const json = JSON.parse(res);
                expect(json).toHaveProperty('chuck');
                expect(json).toEqual({
                    chuck: [
                        { a: 1, b: 2 },
                        { a: 3, b: 4 },
                    ],
                });
                done();
            });
    });
});
