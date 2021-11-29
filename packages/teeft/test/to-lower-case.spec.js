import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('to lower case', () => {
    it('should work on input by default', (done) => {
        from(['ÇA DEVRAIT ÊTRE MIS EN BAS DE CASSE!'])
            .pipe(ezs('TeeftToLowerCase'))
            .on('data', (text) => {
                expect(text).toBe('ça devrait être mis en bas de casse!');
                done();
            })
            .on('error', done);
    });

    it('should use path to select on which part to work', (done) => {
        const res = [];
        from([{ t: 'This Is My Text' }])
            .pipe(ezs('TeeftToLowerCase', { path: ['t'] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const obj = res[0];
                expect(obj).toEqual({t: 'this is my text'});
                done();
            })
            .on('error', done);
    });

    it('should use path to select in arrays too', (done) => {
        const res = [];
        from([[{ t: 'This Is My Text' }]])
            .pipe(ezs('TeeftToLowerCase', { path: ['t'] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                expect(res).toEqual([[{t: 'this is my text'}]]);
                done();
            })
            .on('error', done);
    });

    it('should work on several items', (done) => {
        const res = [];
        from([{ content: 'This is Content!' }, { content: 'This too.' }])
            .pipe(ezs('TeeftToLowerCase', { path: ['content'] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                expect(res).toEqual([
                    { content: 'this is content!' },
                    { content: 'this too.' },
                ]);
                done();
            })
            .on('error', done);
    });

    it('should keep other properties', (done) => {
        const res = [];
        from([{
            content: 'This is Content!',
            other: 1,
        }, {
            content: 'This too.',
            other: 2,
        }])
            .pipe(ezs('TeeftToLowerCase', { path: ['content'] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                expect(res).toEqual([
                    { content: 'this is content!', other: 1 },
                    { content: 'this too.', other: 2 },
                ]);
                done();
            })
            .on('error', done);
    });
});
