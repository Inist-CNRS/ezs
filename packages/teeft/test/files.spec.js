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
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(8);
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
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(5);
                done();
            });
    });

});

describe('TeeftGetFilesContent', () => {
    it('should return the content of one file', (done) => {
        let res = [];
        const dataPath = path.resolve(__dirname, '../examples/data');
        const filePath = `${dataPath}/artificial.txt`;
        from([filePath])
            .pipe(ezs('TeeftGetFilesContent'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res).toMatchObject([{path: filePath}]);
                expect(res[0].content).toHaveLength(1067);
                expect(res[0].content.startsWith('Ceci est')).toBe(true);
                done();
            });
    });

    it('should return the content of two files', (done) => {
        let res = [];
        const dataPath = path.resolve(__dirname, '../examples/data');
        const filePath = `${dataPath}/artificial.txt`;
        from([filePath, filePath])
            .pipe(ezs('TeeftGetFilesContent'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(2);
                expect(res).toMatchObject([{path: filePath}, {path: filePath}]);
                expect(res[0].content).toHaveLength(1067);
                expect(res[0].content.startsWith('Ceci est')).toBe(true);
                expect(res[1].content).toHaveLength(1067);
                expect(res[1].content.startsWith('Ceci est')).toBe(true);
                done();
            });
    });

    it('should return an error when the file does not exist', (done) => {
        let res = [];
        const dataPath = path.resolve(__dirname, '../examples/data');
        const filePath = `${dataPath}/nonexisting.txt`;
        from([filePath])
            .pipe(ezs('TeeftGetFilesContent'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res).toMatchObject([{errno: -2, code: 'ENOENT', path: filePath, syscall: 'open'}]);
                expect(res[0].content).toBeUndefined();
                done();
            });
    });

    it('should continue when encountering an error', (done) => {
        let res = [];
        const dataPath = path.resolve(__dirname, '../examples/data');
        const filePath = `${dataPath}/nonexisting.txt`;
        const filePath2 = `${dataPath}/artificial.txt`;
        from([filePath, filePath2])
            .pipe(ezs('TeeftGetFilesContent'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(2);
                expect(res[0].content).toBeUndefined();
                expect(res).toMatchObject([{
                    path: filePath,
                    errno: -2,
                    code: 'ENOENT',
                    syscall: 'open'
                }, {
                    path: filePath2
                }]);
                expect(res[1].content).toHaveLength(1067);
                expect(res[1].content.startsWith('Ceci est')).toBe(true);
                done();
            });
    });
});