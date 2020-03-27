import assert from 'assert';
import { Readable } from 'stream';
import series from 'array-series';
import parallel from 'array-parallel';
import from from 'from';
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
                .on('error', (e) => expect(e).toBetoBeUndefined())
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
                        .on('error', (e) => expect(e).toBetoBeUndefined())
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
                        .on('error', (e) => expect(e).toBetoBeUndefined())
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
                        .on('error', (e) => expect(e).toBetoBeUndefined())
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
                .on('error', (e) => expect(e).toBetoBeUndefined())
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
                        .on('error', (e) => expect(e).toBetoBeUndefined())
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
                        .on('error', (e) => expect(e).toBetoBeUndefined())
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
                        .on('error', (e) => expect(e).toBetoBeUndefined())
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
                .on('error', (e) => expect(e).toBetoBeUndefined())
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
                .on('error', (e) => expect(e).toBetoBeUndefined())
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
                        .on('error', (e) => expect(e).toBetoBeUndefined())
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
    describe('With invalid parameter', () => {
        const se = ezs('boost');
        it('will throw error', (done) => {
            const ten = new Decade();
            ten
                .pipe(se)
                .on('error', (e) => {
                    expect(e instanceof Error).toBe(true);
                    expect(e.message).toEqual(expect.stringContaining('Invalid'));
                    done();
                })
                .on('data', () => {
                    throw new Error('No chunk');
                });
        });
    });

    describe('with a pipeline no data', () => {
        const script = `
        [transit]

        [transit]
    `;
        const cleanupDelay = 2;
        it('through delegate statement', (done) => {
            let res = 0;

            from([])
                .pipe(ezs('delegate', { script }))
                .on('error', (e) => expect(e).toBetoBeUndefined())
                .on('data', () => {
                    res += 1;
                })
                .on('end', () => {
                    assert.strictEqual(res, 0);
                    done();
                });
        });
        const s1 = ezs('boost', { script, cleanupDelay }, environment);
        it('through boost statement', (done) => {
            // FIRST CALL (no cache)
            let res = 0;
            let cid = null;
            from([])
                .pipe(s1)
                .on('cache:created', (id) => {
                    cid = id;
                })
                .on('error', (e) => expect(e).toBetoBeUndefined())
                .on('data', () => {
                    res += 1;
                })
                .on('end', () => {
                    expect(cid).toBeNull();
                    assert.strictEqual(res, 0);
                    done();
                });
        });
    });

    describe('with a pipeline containing error', () => {
        const script = `
        [transit]

        [plof]

        [transit]
    `;
        const cleanupDelay = 2;
        it('through delegate statement', (done) => {
            let res = 0;

            from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
                .pipe(ezs('delegate', { script }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    expect(e).not.toBeUndefined();
                    expect(res).toEqual(21);
                    done();
                })
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    expect(true).toBeFalsy();
                });
        });
        const s1 = ezs('boost', { script, cleanupDelay }, environment);
        const s2 = ezs('boost', { script, cleanupDelay }, environment);
        it('through boost statement', (alldone) => series(
            [
                (done) => {
                    // FIRST CALL (no cache)
                    let res = 0;
                    let cid = null;
                    from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
                        .pipe(s1)
                        .on('cache:created', (id) => {
                            cid = id;
                        })
                        .pipe(ezs.catch())
                        .on('error', (e) => {
                            expect(cid).not.toBeNull();
                            expect(e).not.toBeUndefined();
                            expect(res).toEqual(21);
                            done();
                        })
                        .on('data', (chunk) => {
                            res += chunk;
                        })
                        .on('end', () => {
                            expect(true).toBeFalsy();
                        });
                },
                (done) => {
                    // SECOND CALL (the cach shouldn't exist)
                    let res = 0;
                    let cid = null;
                    from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
                        .pipe(ezs((input, output) => {
                            // to fool the cache
                            output.send(input === 2 ? 1 : input);
                        }))
                        .pipe(s2)
                        .on('cache:connected', (id) => {
                            cid = id;
                        })
                        .pipe(ezs.catch())
                        .on('error', (e) => {
                            expect(cid).toBeNull();
                            expect(e).not.toBeUndefined();
                            expect(res).toEqual(20);
                            done();
                        })
                        .on('data', (chunk) => {
                            res += chunk;
                        })
                        .on('end', () => {
                            expect(true).toBeFalsy();
                        });
                },
                /**/
            ],
            this,
            alldone,
        ));
    });


    describe.only('with a pipeline & a fixed key in parallel', () => {
        const script = `
        [transit]

        [transit]
    `;
        const cleanupDelay = 2;
        const key = Date.now();
        // WARNING : the lines below allow jest / istanbul to correctly cover all the lines
        // the 3 variables being in a stable scope (instead a dynamic scope)
        const s1 = ezs('boost', { script, cleanupDelay, key }, environment);
        const s2 = ezs('boost', { script, cleanupDelay, key }, environment);
        const s3 = ezs('boost', { script, cleanupDelay, key }, environment);
        it('run a pipeline with boost', (alldone) => parallel(
            [
                (done) => {
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
                        .on('error', (e) => expect(e).toBetoBeUndefined())
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
                    let res = 0;
                    let cid = null;
                    const ten = new Decade();
                    ten
                        .pipe(s2)
                        .on('cache:created', (id) => {
                            cid = id;
                        })
                        .on('error', (e) => expect(e).toBeUndefined())
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
                        .on('error', (e) => expect(e).toBetoBeUndefined())
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
});
