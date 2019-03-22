import assert from 'assert';
import from from 'from';
import ezs from '../src';

describe('statements', () => {
    it('group#1', (done) => {
        from([
            'lorem',
            'Lorem',
            'loren',
            'korem',
            'olrem',
            'toto',
            'titi',
            'truc',
            'lorem',
        ])
            .pipe(ezs('group', { size: 3 }))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                assert(chunk.length === 3);
            })
            .on('end', () => {
                done();
            });
    });
    it('group#2', (done) => {
        const res = [];
        from([
            'lorem',
            'Lorem',
            'loren',
            'korem',
            'olrem',
            'toto',
            'titi',
            'truc',
        ])
            .pipe(ezs('group', { size: 3 }))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res.push(chunk);
            })
            .on('end', () => {
                assert(res[0].length === 3);
                assert(res[0][0] === 'lorem');
                assert(res[1].length === 3);
                assert(res[1][0] === 'korem');
                assert(res[2].length === 2);
                assert(res[2][0] === 'titi');
                done();
            });
    });
    it('ungroup#1', (done) => {
        const res = [];
        from([
            'lorem',
            'Lorem',
            'loren',
            'korem',
            'olrem',
            'toto',
            'titi',
            'truc',
            'lorem',
        ])
            .pipe(ezs('group', { size: 3 }))
            .pipe(ezs('ungroup'))
            .on('data', (chunk) => {
                assert(!Array.isArray(chunk));
                res.push(chunk);
            })
            .on('end', () => {
                assert(res.length === 9);
                done();
            });
    });
    it('ungroup#2', (done) => {
        const res = [];
        from([
            'lorem',
            'Lorem',
            'loren',
            'korem',
            'olrem',
            'toto',
            'titi',
            'truc',
            'lorem',
        ])
            .pipe(ezs('group', { size: 300 }))
            .pipe(ezs('ungroup'))
            .on('data', (chunk) => {
                assert(!Array.isArray(chunk));
                res.push(chunk);
            })
            .on('end', () => {
                assert(res.length === 9);
                done();
            });
    });
    it('ungroup#3', (done) => {
        const res = [];
        from([
            'lorem',
            'Lorem',
            'loren',
            'korem',
            'olrem',
            'toto',
            'titi',
            'truc',
            'lorem',
        ])
            .pipe(ezs('ungroup'))
            .on('data', (chunk) => {
                assert(!Array.isArray(chunk));
                res.push(chunk);
            })
            .on('end', () => {
                assert(res.length === 9);
                done();
            });
    });
    it('concat#1', (done) => {
        from([
            'aa',
            'bb',
            'cc',
            'dd',
            'ee',
            'ff',
        ])
            .pipe(ezs('concat', {
                beginWith: '<',
                joinWith: '|',
                endWith: '>',
            }))
            .on('data', (chunk) => {
                assert.equal(chunk, '<aa|bb|cc|dd|ee|ff>');
            })
            .on('end', () => {
                done();
            });
    });

    it('transit#1', (done) => {
        let index = 0;
        const data = [
            'aa',
            'bb',
            'cc',
            'dd',
            'ee',
            'ff',
        ];
        from(data)
            .pipe(ezs('transit'))
            .pipe(ezs('tracer'))
            .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.equal(chunk, data[index]);
                index += 1;
            })
            .on('end', () => {
                done();
            });
    });

    it('shuffle#1', (done) => {
        const before = [
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
        ];
        const after = [];
        from(before)
            .pipe(ezs('shuffle'))
            .on('data', (chunk) => {
                after.push(chunk);
            })
            .on('end', () => {
                assert.equal(after[2].a.length, 26);
                assert.notEqual(before[2].a, after[2].a);
                done();
            });
    });

    it('shuffle#2', (done) => {
        const before = [
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
        ];
        const after = [];
        from(before)
            .pipe(ezs('shuffle', { path: ['a', 'b'] }))
            .pipe(ezs('debug'))
            .on('data', (chunk) => {
                after.push(chunk);
            })
            .on('end', () => {
                assert.equal(after[3].a.length, 26);
                assert.equal(after[3].b.length, 26);
                assert.equal(after[3].c.length, 26);
                assert.notEqual(after[3].a, before[3].a);
                assert.notEqual(after[3].b, before[3].b);
                assert.equal(after[3].c, before[3].c);
                done();
            });
    });

    it('shuffle#3', (done) => {
        const before = [
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
            { a: 'abcdefghijklmnopqrstuvwxyz', b: 'abcdefghijklmnopqrstuvwxyz', c: 'abcdefghijklmnopqrstuvwxyz' },
        ];
        const after = [];
        from(before)
            .pipe(ezs('shuffle', { path: 'a' }))
            .on('data', (chunk) => {
                after.push(chunk);
            })
            .on('end', () => {
                assert.equal(after[3].a.length, 26);
                assert.equal(after[3].b.length, 26);
                assert.equal(after[3].c.length, 26);
                assert.notEqual(after[3].a, before[3].a);
                assert.equal(after[3].b, before[3].b);
                assert.equal(after[3].c, before[3].c);
                done();
            });
    });


    it('shift#1', (done) => {
        const data = [
            'aa',
            'bb',
            'cc',
            'dd',
            'ee',
            'ff',
        ];
        from(data)
            .pipe(ezs('shift'))
            .on('data', (chunk) => {
                assert.equal(chunk, 'aa');
            })
            .on('end', () => {
                done();
            });
    });

    it('unpack#1', (done) => {
        const res = [];
        from([
            '"aaa"\n"bbb"\n"ccc"\n',
            '"ddd"\n"eee"\n"fff"',
        ])
            .pipe(ezs('unpack'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res[0], 'aaa');
                assert.equal(res[2], 'ccc');
                assert.equal(res[5], 'fff');
                done();
            });
    });
    it('unpack#2', (done) => {
        const res = [];
        from([
            1, 2, 3,
        ])
            .pipe(ezs('unpack'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 0);
                done();
            });
    });

    /* Not yet ready
    it('harvest#2', (done) => {
        let check = true;
        from([
            'https://raw.githubusercontent.com/touv/node-ezs/master/package.no_found',
        ])
            .pipe(ezs('harvest'))
            .on('data', () => {
                check = false;
            })
            .on('end', () => {
                assert.ok(check);
                done();
            });
    });
    */
});
