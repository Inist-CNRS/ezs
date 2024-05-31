import assert from 'assert';
import from from 'from';
import fetch from 'node-fetch';
import ezs from '../src';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;
ezs.settings.cacheEnable = true;
ezs.settings.tracerEnable = false;
ezs.settings.metricsEnable = false;

describe('through server(s)', () => {
    const server = ezs.createServer(33377, __dirname);
    afterAll(() => {
        server.close();
    });

    it('cancel slow request', async (done) => {
        const stream = from([
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
        ]);
        const response1 = await fetch('http://127.0.0.1:33377/transit6.ini?time=300', { method: 'POST', body: stream });
        const requestID = response1.headers.get('x-request-id');
        const output = [];
        response1.body.on('error', (e) => {
            done(e);
        });
        response1.body.on('data', (chunk) => {
            output.push(chunk);
        });
        response1.body.on('end', () => {
            expect(output.length).toBe(1);
            done();
        });
        const response2 = await fetch('http://127.0.0.1:33377/', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'x-request-id': requestID }),
        });
        expect(response2.status).toBe(202);
    });
    it('wrong request', async (done) => {
        const stream = from([
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
        ]);
        const response1 = await fetch('http://127.0.0.1:33377/transit6.ini?time=300', { method: 'POST', body: stream });
        const requestID = response1.headers.get('x-request-id');
        const output = [];
        response1.body.on('error', (e) => {
            done(e);
        });
        response1.body.on('data', (chunk) => {
            output.push(chunk);
        });
        response1.body.on('end', () => {
            expect(output.length).toBe(1);
            done();
        });
        const response2 = await fetch('http://127.0.0.1:33377/', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: {},
        });
        expect(response2.status).toBe(400);
    });

});

