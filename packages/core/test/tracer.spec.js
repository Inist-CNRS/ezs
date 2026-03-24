import assert from 'assert';
import os from 'os';
import from from 'from';
import fetch from 'node-fetch';
import ezs from '../src';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;
ezs.settings.cacheEnable = false;
ezs.settings.tracerEnable = true;

describe('through server(s)', () => {
    const server1 = ezs.createServer(33341, __dirname);
    afterAll(() => {
        server1.close();
    });

    describe('fire server #1', () => {
        it('call statement', (done) => {
            const stream = from([
                'hello',
                'world',
            ]);
            fetch('http://127.0.0.1:33341/transit.ini', { method: 'POST', body: stream })
                .then((res) => res.text())
                .then((text) => {
                    assert.equal(text, 'helloworld');
                    done();
                })
                .catch(done);
        });
    });

});

