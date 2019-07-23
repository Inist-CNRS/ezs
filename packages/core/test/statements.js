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
    it('truncate#1', (done) => {
        const res = [];
        from(['aa', 'bb', 'cc', 'dd', 'ee'])
            .pipe(ezs('truncate'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 5);
                assert.equal(res.join('').length, 10);
                done();
            });
    });
    it('truncate#2', (done) => {
        const res = [];
        from(['aa', 'bb', 'cc', 'dd', 'ee'])
            .pipe(ezs('truncate', { length: 4 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res.join('').length, 4);
                done();
            });
    });
    it('truncate#3', (done) => {
        const res = [];
        from(['aa', 'bb', 'cc', 'dd', 'ee'])
            .pipe(ezs('truncate', { length: 5 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 3);
                assert.equal(res.join('').length, 5);
                done();
            });
    });

    it('truncate#4', (done) => {
        const res = [];
        from([true, false, true, false, true, false, true])
            .pipe(ezs('truncate', { length: 3 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 3);
                done();
            });
    });

    it('dump#1', (done) => {
        const res = [];
        from([
        ])
            .pipe(ezs('dump'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.join(''), '');
                done();
            });
    });

    it('dump#2', (done) => {
        const res = [];
        from([
            new Error(1),
            new Error(2),
        ])
            .pipe(ezs('dump'))
            .pipe(ezs.catch(() => false))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.join(''), '[]');
                done();
            });
    });
    it('dump#2bis', (done) => {
        const res = [];
        from([
            new Error(1),
            new Error(2),
        ])
            .pipe(ezs.catch(() => false))
            .pipe(ezs('dump'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.join(''), '');
                done();
            });
    });
    it('dump#3', (done) => {
        const res = [];
        from([
            new Error(1),
            1,
            new Error(2),
        ])
            .pipe(ezs('dump'))
            .pipe(ezs.catch(() => false))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.join(''), '[1]');
                done();
            });
    });
    it('dump#3bis', (done) => {
        const res = [];
        from([
            new Error(1),
            1,
            new Error(2),
        ])
            .pipe(ezs.catch(() => false))
            .pipe(ezs('dump'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.join(''), '[1]');
                done();
            });
    });
    it('dump#4', (done) => {
        const res = [];
        from([
            1,
        ])
            .pipe(ezs('dump'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.join(''), '[1]');
                done();
            });
    });
    it('dump#5', (done) => {
        const res = [];
        from([
            1,
            2,
            3,
        ])
            .pipe(ezs('dump', { indent: true }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.join(''), '[1,\n2,\n3]');
                done();
            });
    });
    it('validate#1', (done) => {
        const res = [];
        from([
            { a: 1 },
            { a: 2 },
            { a: 3 },
        ])
            .pipe(ezs('validate', { path: 'a', rule: 'required|integer' }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 3);
                done();
            });
    });
    it('validate#2', (done) => {
        const res = [];
        from([
            { a: 1 },
            { a: 'X' },
            { a: 3 },
        ])
            .pipe(ezs('validate', { path: 'a', rule: 'required|integer' }))
            .pipe(ezs.catch((err) => {
                assert.ok(err instanceof Error);
            }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                done();
            });
    });
    it('validate#3', (done) => {
        const res = [];
        from([
            { a: 1, b: 'X' },
            { a: 2, b: 'Y' },
            { a: 3, b: 'Z' },
        ])
            .pipe(ezs('validate', { path: ['a', 'b'], rule: 'required|integer' }))
            .pipe(ezs.catch((err) => {
                assert.fail(err);
            }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 3);
                done();
            });
    });
    it('validate#4', (done) => {
        const res = [];
        from([
            { a: 1, b: 'X' },
            { a: 2, b: 'Y' },
            { a: 3, b: 'Z' },
        ])
            .pipe(ezs('validate', { path: ['a', 'b'], rule: ['required|integer', 'required|string'] }))
            .pipe(ezs.catch((err) => {
                assert.fail(err);
            }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 3);
                done();
            });
    });
    it('validate#5', (done) => {
        const res = [];
        from([
            { a: 1, b: 'X' },
            { a: 2, b: 'Y' },
            { a: 3, b: 'Z' },
        ])
            .pipe(ezs('validate', { path: 'a', rule: ['required|integer', 'required|string'] }))
            .pipe(ezs.catch((err) => {
                assert.fail(err);
            }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 3);
                done();
            });
    });
});
