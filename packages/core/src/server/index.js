import connect from 'connect';
import cluster from 'cluster';
import http from 'http';
import eos from 'end-of-stream';
import controlServer from 'http-shutdown';
import { parse } from 'url';
import debug from 'debug';
import knownPipeline from './knownPipeline';
import serverInformation from './serverInformation';
import serverControl from './serverControl';
import errorHandler from './errorHandler';
import settings from '../settings';
import { RX_FILENAME } from '../constants';
import {
    metrics,
    httpConnectionTotal,
    httpConnectionOpen,
    httpRequestDurationMicroseconds,
    aggregatorRegistry,
} from './metrics';
import {
    createFusible,
    enableFusible,
    disableFusible
} from '../fusible';

function isPipeline() {
    const f = this.pathName.match(RX_FILENAME);
    return (f && f.shift() !== undefined);
}

function methodMatch(values) {
    return (values.indexOf(this.method) !== -1);
}

const signals = ['SIGINT', 'SIGTERM'];

function createServer(ezs, serverPort, serverPath, workerId) {
    const app = connect();
    app.use( async (request, response, next) => {
        const stopTimer = httpRequestDurationMicroseconds.startTimer();
        request.workerId = workerId;
        request.catched = false;
        request.serverPath = serverPath;
        request.urlParsed = parse(request.url, true);
        request.pathName = request.urlParsed.pathname;
        request.methodMatch = methodMatch;
        request.isPipeline = isPipeline;
        request.fusible = await createFusible();
        await enableFusible(request.fusible);
        eos(response, async () => {
            stopTimer();
            await disableFusible(request.fusible);
        });
        next();
    });
    app.use(metrics(ezs));
    app.use(serverInformation(ezs));
    app.use(serverControl(ezs));
    app.use(knownPipeline(ezs));
    app.use((request, response, next) => {
        if (request.catched === false) {
            const error = new Error(`Unable to create middleware for ${request.method} ${request.pathName}`);
            errorHandler(request, response)(error, 404);
        }
        next();
    });
    app.use((error, request, response, next) => {
        errorHandler(request, response)(error, 400);
        next();
    });
    const server = controlServer(http.createServer(app));
    server.setTimeout(0); // default value, useful?
    server.requestTimeout = 0; // ezs has its own timeout see feed.timeout
    server.listen(serverPort);
    server.addListener('connection', (socket) => {
        httpConnectionTotal.inc();
        httpConnectionOpen.inc();
        socket.on('error', (e) => {
            debug('ezs')('Connection error, the server has stopped the request :', e.message);
        });
        socket.on('close', () => {
            httpConnectionOpen.dec();
        });
    });
    signals.forEach((signal) => process.on(signal, () => {
        debug('ezs')(`Signal received, stoping server with PID ${process.pid}`);
        server.shutdown(() => process.exit(0));
    }));
    debug('ezs')(`Server starting with PID ${process.pid} and listening on port ${serverPort}`);
    return server;
}

/* istanbul ignore next */
function createCluster(ezs, serverPort, serverPath) {
    let term = false;
    if (cluster.isMaster) {
        for (let i = 0; i < settings.concurrency; i += 1) {
            cluster.fork();
        }
        cluster.on('exit', () => {
            if (!term) {
                cluster.fork();
            }
        });
        let metricServer;
        if (settings.metricsEnable) {
            metricServer = controlServer(http.createServer(async (req, res) => {
                try {
                    const dumpMetrics = await aggregatorRegistry.clusterMetrics();
                    res.setHeader('Content-Type', aggregatorRegistry.contentType);
                    res.writeHead(200);
                    res.write(dumpMetrics);
                    res.end();
                } catch (ex) {
                    res.writeHead(500);
                    res.write(ex.message);
                    res.end();
                }
            })).listen(serverPort + 1);
            debug('ezs')(`Cluster metrics server listening on port ${serverPort+1}`);
        }
        signals.forEach((signal) => {
            process.on(signal, () => {
                term = true;
                Object.keys(cluster.workers).forEach((id) => cluster.workers[id].kill());
                if (settings.metricsEnable) {
                    metricServer.shutdown(() => process.exit(0));
                }
            });
        });
    } else {
        createServer(ezs, serverPort, serverPath, cluster.worker.id);
    }
    return cluster;
}

export default {
    createServer,
    createCluster,
};
