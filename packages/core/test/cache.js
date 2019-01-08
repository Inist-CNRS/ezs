import assert from 'assert';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';
import ezs from '../src';

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
const cache1 = ezs.createCache({ objectMode: false });
const cacheID1 = 'buffer';

const cache2 = ezs.createCache({ objectMode: true });
const cacheID2 = 'object';

describe('cache - first call (buffer)', () => {
    it('with no cache', (done) => {
        let res = 0;
        const cached = cache1.get(cacheID1);
        if (cached) {
            assert(false);
            done();
        } else {
            assert(true);
            const ten = new Decade();
            ten
                .pipe(ezs.toBuffer())
                .pipe(cache1.set(cacheID1))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, '0123456789');
                    done();
                });
        }
    });
});

describe('cache - second call (buffer)', () => {
    it('with cache', (done) => {
        let res = 0;
        const cached = cache1.get(cacheID1);
        if (cached) {
            assert(true);
            cached
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, '0123456789');
                    done();
                });
        } else {
            assert(false);
        }
    });
});

describe('cache - first call (object)', () => {
    it('with no cache', (done) => {
        let res = 0;
        const cached = cache2.get(cacheID2);
        if (cached) {
            assert(false);
            done();
        } else {
            assert(true);
            const ten = new Decade();
            ten
                .pipe(cache2.set(cacheID2))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 45);
                    done();
                });
        }
    });
});

describe('cache - second call (object)', () => {
    it('with cache', (done) => {
        let res = 0;
        const cached = cache2.get(cacheID2);
        if (cached) {
            assert(true);
            cached
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 45);
                    done();
                });
        } else {
            assert(false);
        }
    });
});
const savedir = path.resolve(os.tmpdir(), 'test');

describe('disk - first save in disk', () => {
    it('try', (done) => {
        const ten = new Decade();
        const disk = ezs.save(savedir);
        ten
            .pipe(disk)
            .on('finish', () => {
                done();
            });
    });
});

describe('disk - second load from disk', () => {
    it('try', (done) => {
        let res = 0;
        const ten = ezs.load(savedir);
        ten
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 45);
                done();
            });
    });
});
