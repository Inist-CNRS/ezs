import assert from 'assert';
import os from 'os';
import path from 'path';
import fetch from 'node-fetch';
import ezs from '../src';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;
ezs.settings.cacheEnable = true;
ezs.settings.tracerEnable = false;
ezs.settings.metricsEnable = false;

describe(' through server(s)', () => {
    const server1 = ezs.createServer(33337, __dirname);
    const server2 = ezs.createServer(33338, path.resolve(__dirname, './localserver/'));
    const server3 = ezs.createServer(33339, path.resolve(__dirname, './localserverko/'));
    afterAll(() => {
        server1.close();
        server2.close();
        server3.close();
    });

    it('get information', (done) => {
        fetch('http://127.0.0.1:33337/')
            .then((res) => res.json())
            .then((json) => {
                assert(json.info['x-uptime'].value);
                assert.equal(os.cpus().length, json.info['x-concurrency'].value);
                done();
            });
    });

    it('get information with custom swagger', (done) => {
        fetch('http://127.0.0.1:33338/')
            .then((res) => res.json())
            .then((json) => {
                assert(json.check);
                assert.equal(os.cpus().length, json.info['x-concurrency'].value);
                done();
            });
    });

    it('get information with custom buggy swagger ', (done) => {
        fetch('http://127.0.0.1:33339/')
            .then((res) => res.json())
            .then((json) => {
                assert.equal(os.cpus().length, json.info['x-concurrency'].value);
                done();
            });
    });

});

