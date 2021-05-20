import assert from 'assert';
import InistArk from 'inist-ark';

import from from 'from';
import ezs from 'ezs';
import locals from '../src';

ezs.use(locals);

const ARK = new InistArk();
describe('generateARK', () => {
    const input = [
        { key: 'value' },
        { key: 'value' },
        { key: 'value' },
    ]
    test('basic', (done) => {
        let cnt = 0;
        from(input)
            .pipe(ezs('generateARK', {
                databasePath: __dirname,
                naan: '12345',
                subpublisher: 'BCD',
            }))
            .on('data', (chunk) => {
                assert.ifError(chunk instanceof Error ? chunk : null);
                assert(chunk.ark);
                assert(ARK.validate(chunk.ark), true);
                cnt += 1;
            })
            .on('end', () => {
                assert(cnt === 3);
                done();
            });
    });
    test('without naan', (done) => {
        let cnt = 0;
        from(input)
            .pipe(ezs('generateARK', { }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                try {
                    expect(e.message).toContain('NAAN is not defined');
                    done();
                }
                catch (e) {
                    done(e);
                }
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('without subpublisher', (done) => {
        let cnt = 0;
        from(input)
            .pipe(ezs('generateARK', {
                naan: '12345',
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                try {
                    expect(e.message).toContain('Subpublisher is not defined');
                    done();
                }
                catch (e) {
                    done(e);
                }
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('without databasePath', (done) => {
        let cnt = 0;
        from(input)
            .pipe(ezs('generateARK', {
                naan: '12345',
                subpublisher: 'BCD',
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                try {
                    expect(e.message).toMatch('databasePath is not defined');
                    done();
                }
                catch (e) {
                    done(e);
                }
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });


});
