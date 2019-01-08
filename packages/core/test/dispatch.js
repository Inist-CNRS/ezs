import assert from 'assert';
import { Readable } from 'stream';
import ezs from '../src';

const {
    M_DISPATCH,
} = ezs.constants;

ezs.use(require('./locals'));

ezs.config('stepper', {
    step: 4,
});

class Upto extends Readable {
    constructor(m) {
        super({ objectMode: true });
        this.i = 0;
        this.m = m;
    }

    _read() {
        this.i += 1;
        if (this.i >= this.m) {
            this.push(null);
        } else {
            this.push(this.i);
        }
    }
}
describe('through a server', () => {
    const server = ezs.createServer(30004);

    after(() => {
        server.close();
    });


    it('with a lot of commands in distributed pipeline', (done) => {
        const commands = [
            {
                name: 'replace',
                mode: M_DISPATCH,
                args: {
                    path: 'a',
                    value: 1,
                },
            },
        ];
        const servers = [
            '127.0.0.1:30004',
        ];
        let res = 0;
        const ten = new Upto(500001);
        ten
            .pipe(ezs('replace', { path: 'a', value: '2' }))
            .pipe(ezs.dispatch(commands, servers))
            .on('data', (chunk) => {
                res += chunk.a;
            })
            .on('end', () => {
                assert.strictEqual(res, 500000);
                done();
            });
    }).timeout(100000);

    /**/
});
