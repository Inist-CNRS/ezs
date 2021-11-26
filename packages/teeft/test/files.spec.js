import from from 'from';
import path from 'path';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('TeeftListFiles', () => {
    it('should return the list of files', (done) => {
        let res = [];
        const dirPath = path.resolve(__dirname, '../examples/data/fr-articles/');
        from([dirPath])
            .pipe(ezs('TeeftListFiles'))
            .on('data', (chunk) => {
                expect(Array.isArray(chunk)).toBe(true);
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(5);
                done();
            });
    });

    it('should return the list of files for every directory', (done) => {
        let res = [];
        from([
            path.resolve(__dirname, '../examples/data/fr-articles/'),
            path.resolve(__dirname, '../examples/data/'),
        ])
            .pipe(ezs('TeeftListFiles'))
            .on('data', (chunk) => {
                expect(Array.isArray(chunk)).toBe(true);
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(7);
                done();
            });
    });

    it('should return no file when input is not a list of directories', (done) => {
        let res = [];
        from([
            path.resolve(__dirname, '../examples/data/artificial.txt'),
        ])
            .pipe(ezs('TeeftListFiles'))
            .pipe(ezs('debug'))
            .on('data', (chunk) => {
                expect(Array.isArray(chunk)).toBe(true);
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(0);
                done();
            });
    });

    it('should return no file when input does not exist', (done) => {
        let res = [];
        from([
            path.resolve(__dirname, '../examples/data/foo'),
        ])
            .pipe(ezs('TeeftListFiles'))
            .on('data', (chunk) => {
                expect(Array.isArray(chunk)).toBe(true);
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(0);
                done();
            });
    });

    it('should return the list of select files', (done) => {
        let res = [];
        const dirPath = path.resolve(__dirname, '../examples/data/fr-articles/');
        from([dirPath])
            .pipe(ezs('TeeftListFiles', { pattern: '*m*.txt' }))
            .on('data', (chunk) => {
                expect(Array.isArray(chunk)).toBe(true);
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(3);
                done();
            });
    });

    it('should return the files from an explicit relative path', (done) => {
        let res = [];
        const dirPath = './packages/teeft/examples/data/fr-articles/';
        from([dirPath])
            .pipe(ezs('TeeftListFiles'))
            .on('data', (chunk) => {
                expect(Array.isArray(chunk)).toBe(true);
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(5);
                done();
            });
    });

    it('should return the files from an implicit relative path', (done) => {
        let res = [];
        const dirPath = 'packages/teeft/examples/data/fr-articles/';
        from([dirPath])
            .pipe(ezs('TeeftListFiles'))
            .on('data', (chunk) => {
                expect(Array.isArray(chunk)).toBe(true);
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(5);
                done();
            });
    });

    it('should return the files with a newline character', (done) => {
        let res = [];
        const dirPath = 'packages/teeft/examples/data/fr-articles/\n';
        from([dirPath])
            .pipe(ezs('TeeftListFiles'))
            .on('data', (chunk) => {
                expect(Array.isArray(chunk)).toBe(true);
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(5);
                done();
            });
    });

});

describe('TeeftGetFilesContent', () => {});