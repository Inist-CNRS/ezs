import assert from 'assert';
import { Readable } from 'stream';
import ezs from '../src';

ezs.use(require('./locals'));

ezs.config('stepper', {
    step: 3,
});


class Decade extends Readable {
    constructor() {
        super({ objectMode: true });
        this.i = 0;
    }

    _read() {
        this.i += 1;
        if (this.i >= 10) {
            this.push(null);
        } else {
            this.push(this.i);
        }
    }
}

describe('Booster', () => {
    //before(done => ezs.getCache().clear().then(done).catch(done));

    describe('Boost script #1', () => {
        const commands = `
        [transit]

        [transit]
    `;
        const statements = ezs.parseString(commands);
        it('with pipeline', (done) => {
            let res = 0;
            const ten = new Decade();
            ten
                .pipe(ezs((input, output) => {
                    output.send(input);
                }))
                .pipe(ezs.pipeline(statements))
                .on('error', assert.fail)
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 45);
                    done();
                });
        });
        describe('first call', () => {
            it('with booster', (done) => {
                let res = 0;
                const ten = new Decade();
                ten
                    .pipe(ezs((input, output) => {
                        output.send(input);
                    }))
                    .pipe(ezs.booster(statements))
                    .on('error', assert.fail)
                    .on('data', (chunk) => {
                        res += chunk;
                    })
                    .on('end', () => {
                        assert.strictEqual(res, 45);
                        done();
                    });
            });
        });
        describe('second call', () => {
            it('with booster', (done) => {
                let res = 0;
                const ten = new Decade();
                ten
                    .pipe(ezs((input, output) => {
                        // to fool the cache
                        output.send(input === 2 ? 1 : input);
                    }))
                    .pipe(ezs.booster(statements))
                    .on('data', (chunk) => {
                        res += chunk;
                    })
                    .on('end', () => {
                        assert.strictEqual(res, 45);
                        done();
                    });
            });
        });
        /**/
    });
    describe('Boost script #2', () => {
        const commands = `
        [increment]
        step = 2

        [decrement]
        step = 1
    `;
        const statements = ezs.parseString(commands);
        it('with pipeline', (done) => {
            let res = 0;
            const ten = new Decade();
            ten
                .pipe(ezs((input, output) => {
                    output.send(input);
                }))
                .pipe(ezs.pipeline(statements))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });
        it('with booster', (done) => {
            let res = 0;
            const ten = new Decade();
            ten
                .pipe(ezs((input, output) => {
                    output.send(input);
                }))
                .pipe(ezs.booster(statements))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });
        /**/
    });
});
