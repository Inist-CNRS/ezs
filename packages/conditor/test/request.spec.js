import http from 'http';
import retry from 'async-retry';
import request from '../src/request';

describe('request', () => {
    let server;
    let url;
    let hits;
    let answer;

    beforeAll((done) => {
        server = http.createServer((req, res) => {
            hits += 1;
            res.writeHead(answer.status, { 'Content-Type': answer.type });
            res.end(answer.body);
        });
        server.listen(0, () => {
            url = `http://127.0.0.1:${server.address().port}/`;
            done();
        });
    });
    afterAll((done) => server.close(done));
    beforeEach(() => {
        hits = 0;
    });

    const send = () => retry(request(url, { method: 'GET' }), {
        retries: 2,
        minTimeout: 1,
    });

    test('keeps the status and the JSON answer of the server, without retrying a 400', async () => {
        answer = {
            status: 400,
            type: 'application/json',
            body: '{"error":"Invalid query parameters error.","message":"x is not a valid field."}',
        };
        const err = await send().catch((e) => e);
        expect(err.message).toBe('Bad Request');
        expect(err.status).toBe(400);
        expect(err.responseText).toBe(answer.body);
        expect(err.body).toEqual(JSON.parse(answer.body));
        expect(hits).toBe(1);
    });

    test('keeps an error page that is not JSON, and retries a 503', async () => {
        answer = {
            status: 503,
            type: 'text/html',
            body: '<html><body>Maintenance</body></html>',
        };
        const err = await send().catch((e) => e);
        expect(err.message).toBe('Service Unavailable');
        expect(err.status).toBe(503);
        expect(err.responseText).toBe(answer.body);
        expect(err.body).toBeUndefined();
        expect(hits).toBe(3);
    });
});
