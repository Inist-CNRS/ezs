import assert from 'assert';
import { Readable } from 'stream';
import ezs from '../src';

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

describe('Catch error in a pipeline', () => {
    it('with sync error(throw)', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs(() => {
                throw new Error('Bang!');
            }))
            .on('error', () => {
                throw new Error('The sync errors should be injected in the pipeline');
            })
            .on('data', (chunk) => {
                assert.ok(chunk instanceof Error);
            }).on('end', () => {
                done();
            });
    });
    it('with sync but emit error(throw)', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs(() => {
                throw new Error('Bang!');
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                assert.ok(e instanceof Error);
                done();
            })
            .on('data', () => {
                throw new Error('ezs.catch emit should emit error');
            })
            .on('end', () => {
                throw new Error('ezs.catch emit should emit error');
            });
    });

    // https://bytearcher.com/articles/why-asynchronous-exceptions-are-uncatchable/
    // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Promise/catch#Les_promesses_n'interceptent_pas_les_exceptions_lev%C3%A9es_de_fa%C3%A7on_asynchrone
    it.skip('with errors in every chunk processed by a asynchronous statement (throw)', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('badaboum'))
            .on('error', (error) => {
                assert.equal(error.message.split('\n')[0], 'Processing item #1 failed with Error: Badaboum!');
                done();
            })
            .on('data', () => {
                throw new Error('no data should be received');
            });
    });
    it('with errors in every chunk processed by a synchronous statement (send)', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('boum'))
            .on('error', () => {
                throw new Error('The sent errors should be injected in the pipeline');
            })
            .on('data', (chunk) => {
                assert.ok(chunk instanceof Error);
            })
            .on('end', () => {
                done();
            });
    });
    it('with errors in every chunk processed by a asynchronous statement (stop)', (done) => {
        const ten = new Decade();
        let counter = 0;
        let errmsg = '';
        ten
            .pipe(ezs('plouf'))
            .on('error', (error) => {
                counter += 1;
                [errmsg] = error.message.split('\n');
            })
            .on('data', () => {
                throw new Error('no data should be received');
            })
            .on('end', () => {
                assert.equal(1, counter);
                assert.equal(errmsg, '(item #1 in [plouf] failed with Error: Plouf #1)');
                done();
            });
    });
    it('with one error in one chunk processed by a asynchronous statement (stop)', (done) => {
        const ten = new Decade();
        let counter = 0;
        let errmsg = '';
        ten
            .pipe(ezs('plaf'))
            .on('data', (chunk) => {
                counter += chunk;
            })
            .on('error', (error) => {
                [errmsg] = error.message.split('\n');
            })
            .on('end', () => {
                assert.equal(21, counter);
                assert.equal(errmsg, '(item #7 in [plaf] failed with Error: Plaf!)');
                done();
            });
    });
    it('with errors in every chunk processed by a synchronous statement that sends them to the outgoing stream (send)',
        (done) => {
            let counter = 0;
            const ten = new Decade();
            ten
                .pipe(ezs('boum'))
                .pipe(ezs.catch(() => null))
                .on('data', () => {
                    counter += 1;
                })
                .on('end', () => {
                    assert.equal(0, counter);
                    done();
                });
        });
    it('catch & get error', (done) => {
        let counter = 0;
        const ten = new Decade();
        ten
            .pipe(ezs('boum'))
            .pipe(ezs.catch((err) => {
                assert.ok(err instanceof Error);
            }))
            .on('data', () => {
                counter += 1;
            })
            .on('end', () => {
                assert.equal(0, counter);
                done();
            });
    });
    it('with statement that resolve a promise', (done) => {
        let counter = 1;
        const ten = new Decade();
        ten
            .pipe(ezs('splish'))
            .on('data', () => {
                counter += 1;
            })
            .on('end', () => {
                assert.equal(10, counter);
                done();
            });
    });
    it('with statement that reject a promise', (done) => {
        let counter = 1;
        const ten = new Decade();
        ten
            .pipe(ezs('splash'))
            .on('data', () => {
                counter += 1;
            })
            .on('end', () => {
                assert.equal(1, counter);
                done();
            });
    });

    it('with singleton and error (send)', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('singleton', { command: 'boum' }))
            .on('error', (err) => {
                assert.ok(err instanceof Error);
                done();
            });
    });

    it('with singleton and error (throw)', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('singleton', { command: 'bang' }))
            .on('error', (err) => {
                assert.ok(err instanceof Error);
                done();
            });
    });

    it('with no existing plugin', (done) => {
        const commands = `
            [use]
            plugin = fake

            [transit]
        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs('delegate', { script: commands }))
            .pipe(ezs.catch((e) => e))
            .on('error', (err) => {
                assert.ok(err instanceof Error);
                done();
            });
    });
});
