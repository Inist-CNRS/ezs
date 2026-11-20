import assert from 'assert';
import http from 'http';
import net from 'net';
import ezs from '../src';
import { metrics } from '../src/server/metrics';

const metricsMiddleware = metrics(ezs);
// A custom agent is never configured with proxyEnv: it always connects directly.
const directAgent = new http.Agent();

describe('cluster metrics and proxies', () => {
    let aggregator;
    let proxy;
    let server;
    let failUpstream = false;
    let proxyHits = 0;
    const initialGlobalAgent = http.globalAgent;

    beforeAll((done) => {
        aggregator = http.createServer((request, response) => {
            if (failUpstream) {
                request.socket.destroy();
                return;
            }
            response.end('AGGREGATED METRICS');
        });
        proxy = http.createServer((request, response) => {
            proxyHits += 1;
            response.end('PROXIED');
        });
        // Simulates a worker: workerId is set, so /metrics is fetched from the master
        server = http.createServer((request, response) => {
            request.workerId = 1;
            request.catched = false;
            request.pathName = '/metrics';
            metricsMiddleware(request, response, () => {
                response.statusCode = 500;
                response.end('next() called');
            });
        });
        aggregator.listen(0, '0.0.0.0', () => {
            proxy.listen(0, '127.0.0.1', () => {
                server.listen(0, '127.0.0.1', () => {
                    ezs.settings.metricsEnable = true;
                    ezs.settings.port = aggregator.address().port - 1;
                    // Simulates NODE_USE_ENV_PROXY=1: the global agent sends
                    // every request it handles to the proxy
                    const proxyingAgent = new http.Agent();
                    proxyingAgent.createConnection = () => net.connect(proxy.address().port, '127.0.0.1');
                    http.globalAgent = proxyingAgent;
                    done();
                });
            });
        });
    });

    afterEach(() => {
        failUpstream = false;
    });

    afterAll((done) => {
        http.globalAgent = initialGlobalAgent;
        server.close(() => proxy.close(() => aggregator.close(done)));
    });

    it('should not route the internal /metrics request through the proxy', (done) => {
        http.get({
            hostname: '127.0.0.1',
            port: server.address().port,
            path: '/metrics',
            agent: directAgent,
        }, (response) => {
            let body = '';
            response.on('data', (chunk) => { body += chunk; });
            response.on('end', () => {
                assert.equal(body, 'AGGREGATED METRICS');
                assert.equal(proxyHits, 0);
                done();
            });
        }).on('error', done);
    });

    it('should report an upstream error instead of crashing', (done) => {
        failUpstream = true;
        http.get({
            hostname: '127.0.0.1',
            port: server.address().port,
            path: '/metrics',
            agent: directAgent,
        }, (response) => {
            let body = '';
            response.on('data', (chunk) => { body += chunk; });
            response.on('end', () => {
                assert.equal(body, 'next() called');
                done();
            });
        }).on('error', done);
    });
});
