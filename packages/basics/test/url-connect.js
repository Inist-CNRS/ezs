import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

ezs.addPath(__dirname);
ezs.settings.servePath = __dirname;

describe('URLConnect', () => {
    const server5 = ezs.createServer(33331, __dirname);
    afterAll(() => {
        server5.close();
    });
    test('#1', (done) => {
        const input = [1, 2, 3, 4, 5];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/transit.ini',
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(5);
                expect(output).toStrictEqual(input);
                done();
            });
    });
    test('#2', (done) => {
        const input = [1, 2, 3, 4, 5];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/transit.ini',
                json: false,
            }))
            .pipe(ezs('JSONParse'))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(5);
                expect(output).toStrictEqual(input);
                done();
            });
    });
    test('#3', (done) => {
        const input = [1, 2, 3, 4, 5];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/nofound.ini',
            }))
            .pipe(ezs.catch())
            .on('error', () => {
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
});
