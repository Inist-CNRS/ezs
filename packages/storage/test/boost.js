import assert from 'assert';
import { Readable } from 'stream';
import series from 'array-series';
import ezs from '../../core/src';

ezs.use(require('../src'));
ezs.use(require('./locals'));


const environment = {
    launchedDate: Date.now(),
};

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

describe('boost', () => {
    describe('with a pipeline & a computed key', () => {
        const script = `
        [transit]

        [transit]
    `;
        const cleanupDelay = 2;
        it('through delegate statement', (done) => {
            let res = 0;
            const ten = new Decade();
            ten
                .pipe(ezs((input, output) => {
                    output.send(input);
                }))
                .pipe(ezs('delegate', { script }))
                .on('error', assert.ifError)
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 45);
                    done();
                });
        });
        const s1 = ezs('boost', { script, cleanupDelay }, environment);
        const s2 = ezs('boost', { script, cleanupDelay }, environment);
        const s3 = ezs('boost', { script, cleanupDelay }, environment);
        it('through boost statement', (alldone) => series(
            [
                (done) => {
                    // FIRST CALL (no cache)
                    let res = 0;
                    let cid = null;
                    const ten = new Decade();
                    ten
                        .pipe(ezs((input, output) => {
                            output.send(input);
                        }))
                        .pipe(s1)
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
                },
                (done) => {
                    // SECOND CALL (hit the cache)
                    let res = 0;
                    let cid = null;
                    const ten = new Decade();
                    ten
                        .pipe(ezs((input, output) => {
                            // to fool the cache
                            output.send(input === 2 ? 1 : input);
                        }))
                        .pipe(s2)
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
                },
                (done) => {
                    // WAIT, cache will exipre
                    setTimeout(done, cleanupDelay * 1000);
                },
                (done) => {
                    let res = 0;
                    let cid = null;
                    const ten = new Decade();
                    ten
                        .pipe(ezs((input, output) => {
                            output.send(input);
                        }))
                        .pipe(s3)
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
                },
                /**/
            ],
            this,
            alldone,
        ));
    });
    describe('with a pipeline & a fixed key', () => {
        const script = `
        [transit]

        [transit]
    `;
        const cleanupDelay = 3;
        const key = Date.now();
        it('run a pipeline without boost', (done) => {
            let res = 0;
            const ten = new Decade();
            ten
                .pipe(ezs((input, output) => {
                    output.send(input);
                }))
                .pipe(ezs('delegate', { script }))
                .on('error', assert.ifError)
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 45);
                    done();
                });
        });
        // WARNING : the lines below allow jest / istanbul to correctly cover all the lines
        // the 3 variables being in a stable scope (instead a dynamic scope)
        const s1 = ezs('boost', { script, cleanupDelay, key }, environment);
        const s2 = ezs('boost', { script, cleanupDelay, key }, environment);
        const s3 = ezs('boost', { script, cleanupDelay, key }, environment);
        it('run a pipeline with boost', (alldone) => series(
            [
                (done) => {
                    // FIRST CALL (no cache)
                    let res = 0;
                    let cid = null;
                    const ten = new Decade();
                    ten
                        .pipe(ezs((input, output) => {
                            output.send(input);
                        }))
                        .pipe(s1)
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
                },
                (done) => {
                    // SECOND CALL (hit the cache)
                    let res = 0;
                    let cid = null;
                    const ten = new Decade();
                    ten
                        .pipe(ezs((input, output) => {
                            // to fool the cache
                            output.send(input === 2 ? 1 : input);
                        }))
                        .pipe(s2)
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
                },
                (done) => {
                    // WAIT, cache will exipre
                    setTimeout(done, cleanupDelay * 1000);
                },
                (done) => {
                    let res = 0;
                    let cid = null;
                    const ten = new Decade();
                    ten
                        .pipe(ezs((input, output) => {
                            output.send(input);
                        }))
                        .pipe(s3)
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
                },
                /**/
            ],
            this,
            alldone,
        ));
    });

    describe('Boost script #2', () => {
        const script = `
        [increment]
        step = 2

        [decrement]
        step = 1
    `;
        it('with pipeline', (done) => {
            let res = 0;
            const ten = new Decade();
            ten
                .pipe(ezs((input, output) => {
                    output.send(input);
                }))
                .pipe(ezs('delegate', { script }))
                .on('error', assert.ifError)
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });
        const s1 = ezs('boost', { script }, environment);
        it('with boost', (done) => {
            let res = 0;
            const ten = new Decade();
            ten
                .pipe(ezs((input, output) => {
                    output.send(input);
                }))
                .pipe(s1)
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
    describe('Boost script #5 (with error)', () => {
        const script = `
        [transit]
        [transit]
        [transit]
        [transit]
        [transit]
    `;
        let cid = null;
        // WARNING : the lines below allow jest / istanbul to correctly cover all the lines
        // the 2 variables being in a stable scope (instead a dynamic scope)
        const s1 = ezs('boost', { script }, environment);
        const s2 = ezs('boost', { script }, environment);
        it('series', (alldone) => series(
            [
                (done) => {
                    let res = 0;
                    let cnt = 0;
                    const ten = new Decade();
                    ten
                        .pipe(ezs((input, output) => {
                            cnt += 1;
                            if (cnt === 5) {
                                output.send(new Error('Paf'));
                            } else {
                                output.send(input);
                            }
                        }))
                        .pipe(s1)
                        .on('cache:created', (id) => {
                            cid = id;
                        })
                        .pipe(ezs.catch((e) => assert(e)))
                        .on('data', (chunk) => {
                            res += chunk;
                        })
                        .on('end', () => {
                            assert.strictEqual(res, 40);
                            assert.notEqual(cid, null);
                            done();
                        });
                },
                (done) => {
                    let res = 0;
                    const ten = new Decade();
                    ten
                        .pipe(ezs((input, output) => {
                            // to fool the cache
                            output.send(input === 2 ? 1 : input);
                        }))
                        .pipe(s2)
                        .pipe(ezs('transit'))
                        .pipe(ezs.catch((e) => e))
                        .on('error', assert.ifError)
                        .on('data', (chunk) => {
                            res += chunk;
                        })
                        .on('end', () => {
                            assert.strictEqual(res, 40);
                            assert.notEqual(cid, null);
                            done();
                        });
                },
            ],
            this,
            alldone,
        ));
    });
});
