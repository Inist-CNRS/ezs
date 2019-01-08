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


    /* Not yet ready
    it('harvest#1', (done) => {
        from([
            'https://raw.githubusercontent.com/touv/node-ezs/master/package.json',
        ])
            .pipe(ezs('harvest'))
            .on('data', (chunk) => {
                assert(Buffer.isBuffer(chunk));
                assert(JSON.parse(chunk).name === 'ezs');
            })
            .on('end', () => {
                done();
            });
    });
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
