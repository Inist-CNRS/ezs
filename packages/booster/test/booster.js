import assert from 'assert';
import { Readable } from 'stream';
import fs from 'fs';
import ezs from 'ezs';
import Cache from '../src/cache';

ezs.use(require('../src'));
ezs.use(require('./locals'));

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
    before(() => {
        const handle = new Cache();
        return handle.clear();
    });

    describe('Boost script #1', () => {
        const script = `
        [transit]

        [transit]
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
                    .pipe(ezs('booster', { 
                        script,
                        cleanupOnStartup: true,
                    }))
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
                    .pipe(ezs('booster', { script }))
                    .on('cache:connected', (id) => {
                        console.log('cid', cid);
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
        it('with booster', (done) => {
            let res = 0;
            const ten = new Decade();
            ten
                .pipe(ezs((input, output) => {
                    output.send(input);
                }))
                .pipe(ezs('booster', { script }))
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
    describe.skip('Boost script #3 (with error)', () => {
        const script = `
        [transit]

        [transit]

        [transit]
    `;
        let cid = null;
        describe('first call', () => {
            it('with booster', (done) => {
                let res = 0;
                const ten = new Decade();
                ten
                    .pipe(ezs((input, output) => {
                        output.send(input);
                    }))
                    .pipe(ezs('booster', { script }))
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
                    .pipe(ezs('booster', { script }))
                    .on('error', (error) => {
                        assert(error instanceof Error);
                        done();
                    });
            });
        });
        /**/
    });
    describe.skip('Boost script #4 (with error)', () => {
        const script = `
        [transit]

        [transit]

        [transit]

        [transit]
    `;
        let cid = null;
        describe('first call', () => {
            it('with booster', (done) => {
                let res = 0;
                const ten = new Decade();
                ten
                    .pipe(ezs((input, output) => {
                        output.send(input);
                    }))
                    .pipe(ezs('booster', { script }))
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
                fs.writeFileSync(`/tmp/ezs/${cid}`, Buffer.from('H4sIAJjfd1wAA4vmAgB+f0P4AgAAAA==', 'base64'));

                const ten = new Decade();
                ten
                    .pipe(ezs((input, output) => {
                        // to fool the cache
                        output.send(input === 2 ? 1 : input);
                    }))
                    .pipe(ezs('booster', { script }))
                    .pipe(ezs('transit'))
                    .pipe(ezs.catch(e => e))
                    .on('error', (error) => {
                        assert(error instanceof Error);
                        done();
                    });
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
        describe('first call', () => {
            it('with booster', (done) => {
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
                    .pipe(ezs('booster', { script }))
                    .on('cache:created', (id) => {
                        cid = id;
                    })
                    .pipe(ezs.catch(e => assert(e)))
                    .on('data', (chunk) => {
                        res += chunk;
                    })
                    .on('end', () => {
                        assert.strictEqual(res, 40);
                        assert.notEqual(cid, null);
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
                    .pipe(ezs('booster', { script }))
                    .pipe(ezs('transit'))
                    .pipe(ezs.catch(e => e))
                    .on('error', assert.ifError)
                    .on('data', (chunk) => {
                        res += chunk;
                    })
                    .on('end', () => {
                        assert.strictEqual(res, 40);
                        assert.notEqual(cid, null);
                        done();
                    });
            });
        });
    });

/*
    describe('Boost script #6 (with error)', () => {
        const script = `
        [transit]
        [transit]
        [transit]
        [transit]
        [transit]
        [transit]
    `;
        let cid = null;
        describe('first call', () => {
            it('with booster', (done) => {
                let res = 0;
                let cnt = 0;
                const ten = new Decade();
                const boost = ezs.booster(statements);
                ten
                    .pipe(boost)
                    .pipe(ezs((input, output) => {
                        cnt += 1;
                        if (cnt === 5) {
                            boost.emit('error', new Error('Pif'));
                        }
                        output.send(input);
                    }))
                    .on('error', assert.ifError)
                    .on('cache:created', (id) => {
                        cid = id;
                    })
                    .on('data', (chunk) => {
                        res += chunk;
                    })
                    .on('end', () => {
                        assert.strictEqual(res, 0);
                        assert.notEqual(cid, null);
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
                        throw new Error('Pif');
                    }))
                    .pipe(ezs.booster(statements))
                    .on('error', assert.ifError)
                    .on('data', (chunk) => {
                        res += chunk;
                    })
                    .on('end', () => {
                        assert.strictEqual(res, 40);
                        assert.notEqual(cid, null);
                        done();
                    });
            });
        });
    });
*/
});
