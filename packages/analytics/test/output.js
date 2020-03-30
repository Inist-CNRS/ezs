import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('output', () => {
    it('should work without param', (done) => {
        let res = '';
        from([{ a: 1, b: 2 }, { a: 3, b: 4 }])
            .pipe(ezs('output'))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                expect(res).toHaveLength(48);
                expect(res).toEqual('{"meta":{},"data":[{"a":1,"b":2},{"a":3,"b":4}]}');
                done();
            });
    });

    it('should indent output when asked', (done) => {
        let res = '';
        from([{ a: 1, b: 2 }, { a: 3, b: 4 }])
            .pipe(ezs('output', { indent: true }))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                expect(res).toHaveLength(104);
                expect(res).toBe("{\n    \"meta\":{\n    },\n    \"data\":[\n    {\n    \"a\": 1,\n    \"b\": 2\n},\n    {\n    \"a\": 3,\n    \"b\": 4\n}]}\n    ");
                done();
            });
    });

    it('should extract a property from objects', (done) => {
        let res = '';
        from([
            { a: 1, b: 2, t: 3 },
            { a: 4, b: 5, t: 6 },
        ])
            .pipe(ezs('output', { meta: 't' }))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                const json = JSON.parse(res);
                expect(json).toEqual({
                    data: [
                        { a: 1, b: 2 },
                        { a: 4, b: 5 },
                    ],
                    meta: {
                        t: 3,
                    },
                });
                done();
            });
    });
    it('should extract many properies from objects', (done) => {
        let res = '';
        from([
            {
                a: 1, b: 2, t: 3, x: true, y: 'OK',
            },
            {
                a: 4, b: 5, t: 6, x: false, y: 'OK',
            },
        ])
            .pipe(ezs('output', { meta: ['t', 'x', 'y'] }))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                const json = JSON.parse(res);
                expect(json).toEqual({
                    data: [
                        { a: 1, b: 2 },
                        { a: 4, b: 5 },
                    ],
                    meta: {
                        t: 3,
                        x: true,
                        y: 'OK',
                    },
                });
                done();
            });
    });

    it('should extract many properies from objects (but some does not exist', (done) => {
        let res = '';
        from([
            {
                a: 1, b: 2, t: 3, y: 'OK',
            },
            {
                a: 4, b: 5, t: 6, y: 'OK',
            },
        ])
            .pipe(ezs('output', { meta: ['t', 'x', 'y'] }))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                const json = JSON.parse(res);
                expect(json).toEqual({
                    data: [
                        { a: 1, b: 2 },
                        { a: 4, b: 5 },
                    ],
                    meta: {
                        t: 3,
                        y: 'OK',
                    },
                });
                done();
            });
    });


    it('should extract many properies from objects (but some does not exist', (done) => {
        let res = '';
        from([
            {
                a: 1, b: 2,
            },
            {
                a: 4, b: 5,
            },
        ])
            .pipe(ezs('output', { meta: ['t', 'x', 'y'] }))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                const json = JSON.parse(res);
                expect(json).toEqual({
                    data: [
                        { a: 1, b: 2 },
                        { a: 4, b: 5 },
                    ],
                    meta: {
                    },
                });
                done();
            });
    });

    it('should extract no property from objects', (done) => {
        let res = '';
        from([
            { a: 1, b: 2 },
            { a: 3, b: 4 },
        ])
            .pipe(ezs('output'))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                const json = JSON.parse(res);
                expect(json).toEqual({
                    data: [
                        { a: 1, b: 2 },
                        { a: 3, b: 4 },
                    ],
                    meta: {},
                });
                done();
            });
    });

    it('should return 1 object', (done) => {
        let res = '';
        from([
            [ 1 ],
        ])
            .pipe(ezs('output'))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                const json = JSON.parse(res);
                expect(json).toEqual({
                    data: [
                        [ 1 ],
                    ],
                    meta: {},
                });
                done();
            });
    });


    it('should return empty array', (done) => {
        let res = '';
        from([
        ])
            .pipe(ezs('output'))
            .on('data', (data) => { res += data; })
            .on('end', () => {
                expect(res).toEqual('');
                done();
            });
    });
});
