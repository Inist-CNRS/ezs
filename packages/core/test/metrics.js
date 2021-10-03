import assert from 'assert';
import os from 'os';
import from from 'from';
import fetch from 'node-fetch';
import ezs from '../src';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;
ezs.settings.cacheEnable = true;
ezs.settings.tracerEnable = false;
ezs.settings.metricsEnable = true;

describe(' through server(s)', () => {
    const server1 = ezs.createServer(33340, __dirname);
    afterAll(() => {
        server1.close();
    });

    describe('fire server #1', () => {
        it('call statement', (done) => {
            const stream = from([
                'hello',
                'world',
            ]);
            fetch('http://127.0.0.1:33340/transit.ini', { method: 'POST', body: stream })
                .then((res) => res.text())
                .then((text) => {
                    assert.equal(text, 'helloworld');
                    done();
                })
                .catch(done);
        });
    });

    describe('get metrics #2', () => {
        it('call /metrics', (done) => {
            fetch('http://127.0.0.1:33340/metrics')
                .then((res) => res.text())
                .then((text) => {
                    assert(text.indexOf('ezs_stream_chunks_sum{pathName="/transit.ini",bucket="input"} 3') !== -1);
                    done();
                });
        });
    });

    describe('fire server #3', () => {
        it('call statement', (done) => {
            const stream = from([
                'hello',
                'world',
            ]);
            fetch('http://127.0.0.1:33340/transit.ini', { method: 'POST', body: stream })
                .then((res) => res.text())
                .then((text) => {
                    assert.equal(text, 'helloworld');
                    done();
                })
                .catch(done);
        });
    });

    describe('get metrics #4', () => {
        it('call /metrics', (done) => {
            fetch('http://127.0.0.1:33340/metrics')
                .then((res) => res.text())
                .then((text) => {
                    assert(text.indexOf('ezs_stream_chunks_sum{pathName="/transit.ini",bucket="input"} 6') !== -1);
                    done();
                });
        });
    });


});

