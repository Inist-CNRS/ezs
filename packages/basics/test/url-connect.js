import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.addPath(__dirname);
ezs.settings.servePath = __dirname;

let serverHandle;
describe('URLConnect', () => {
    beforeAll((ready) => {
        serverHandle = ezs.createServer(33331, __dirname);
        serverHandle.on('listening', () => ready());
    });
    afterAll(() => {
        serverHandle.close();
    });
    test('#1', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/transit.ini',
                timeout: 5000,
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
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/transit.ini',
                json: false,
                timeout: 'fakevalue', // for test
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
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/nofound.ini',
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(() => {
                    throw e.sourceError;
                }).toThrow('Received status code 404 (Not Found)');
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('#4', (done) => {
        ezs.use(statements);
        const input = ['1a', '2a', '3a', '4a', '5a'];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/tocsv.ini',
                json: true,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(() => {
                    throw e.sourceError;
                }).toThrow("Invalid JSON (Unexpected \"\\r\" at position 3 in state STOP)");
                done();
            })
            .on('data', () => {
                done(new Error('Error is the right behavior'));
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('#5', (done) => {
        ezs.use(statements);
        const input = ['1a', '2a', '3a', '4a', '5a'];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:11111/',
                json: true,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(() => {
                    throw e.sourceError;
                }).toThrow('request to http://127.0.0.1:11111/ failed, reason: connect ECONNREFUSED 127.0.0.1:11111');
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
});
