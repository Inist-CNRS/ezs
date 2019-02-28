import assert from 'assert';
import { Readable } from 'stream';
import fs from 'fs';
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
    before(() => ezs.getCache().clear());

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
                .on('error', assert.ifError)
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
                let cid = null;
                const ten = new Decade();
                ten
                    .pipe(ezs((input, output) => {
                        output.send(input);
                    }))
                    .pipe(ezs.booster(statements))
                    .on('cache:created', (id) => {
                        cid = id;
                    })
                    .on('error', assert.ifError)
                    .on('data', (chunk) => {
                        res += chunk;
                    })
                    .on('end', () => {
                        assert.notEqual(cid, null);
                        assert.strictEqual(res, 45);
                        done();
                    });
            });
        });
        describe('second call', () => {
            it('with booster', (done) => {
                let res = 0;
                let cid = null;
                const ten = new Decade();
                ten
                    .pipe(ezs((input, output) => {
                        // to fool the cache
                        output.send(input === 2 ? 1 : input);
                    }))
                    .pipe(ezs.booster(statements))
                    .on('cache:connected', (id) => {
                        cid = id;
                    })
                    .on('error', assert.ifError)
                    .on('data', (chunk) => {
                        res += chunk;
                    })
                    .on('end', () => {
                        assert.notEqual(cid, null);
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
                .on('error', assert.ifError)
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
                .on('error', assert.ifError)
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
    describe('Boost script #3 (with error)', () => {
        const commands = `
        [transit]

        [transit]

        [transit]
    `;
        let cid = null;
        const statements = ezs.parseString(commands);
        describe('first call', () => {
            it('with booster', (done) => {
                let res = 0;
                const ten = new Decade();
                ten
                    .pipe(ezs((input, output) => {
                        output.send(input);
                    }))
                    .pipe(ezs.booster(statements))
                    .on('cache:created', (id) => {
                        cid = id;
                    })
                    .on('error', assert.ifError)
                    .on('data', (chunk) => {
                        res += chunk;
                    })
                    .on('end', () => {
                        assert.strictEqual(res, 45);
                        assert.notEqual(cid, null);
                        done();
                    });
            });
        });
        describe('second call', () => {
            it('with booster', (done) => {
                // force error
                fs.writeFileSync(`/tmp/ezs/${cid}`, Buffer.from(''));

                const ten = new Decade();
                ten
                    .pipe(ezs((input, output) => {
                        // to fool the cache
                        output.send(input === 2 ? 1 : input);
                    }))
                    .pipe(ezs.booster(statements))
                    .on('error', (error) => {
                        assert(error instanceof Error);
                        done();
                    });
            });
        });
        /**/
    });
    describe('Boost script #4 (with error)', () => {
        const commands = `
        [transit]

        [transit]

        [transit]

        [transit]
    `;
        let cid = null;
        const statements = ezs.parseString(commands);
        describe('first call', () => {
            it('with booster', (done) => {
                let res = 0;
                const ten = new Decade();
                ten
                    .pipe(ezs((input, output) => {
                        output.send(input);
                    }))
                    .pipe(ezs.booster(statements))
                    .on('cache:created', (id) => {
                        cid = id;
                    })
                    .on('error', assert.ifError)
                    .on('data', (chunk) => {
                        res += chunk;
                    })
                    .on('end', () => {
                        assert.strictEqual(res, 45);
                        assert.notEqual(cid, null);
                        done();
                    });
            });
        });
        describe('third call', () => {
            it('with booster', (done) => {
                // force error
                fs.writeFileSync(`/tmp/ezs/${cid}`, Buffer.from('H4sIAJjfd1wAA4vmAgB+f0P4AgAAAA==', 'base64'));

                const ten = new Decade();
                ten
                    .pipe(ezs((input, output) => {
                        // to fool the cache
                        output.send(input === 2 ? 1 : input);
                    }))
                    .pipe(ezs.booster(statements))
                    .on('data', console.log)
                    .on('error', (error) => {
                        assert(error instanceof Error);
                        done();
                    });
            });
        });

        /**/
    });

});
