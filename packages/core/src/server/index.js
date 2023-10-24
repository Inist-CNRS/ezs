import connect from 'connect';
import cluster from 'cluster';
import http from 'http';
import eos from 'end-of-stream';
import controlServer from 'http-shutdown';
import { parse } from 'url';
import debug from 'debug';
import knownPipeline from './knownPipeline';
import unknownPipeline from './unknownPipeline';
import serverInformation from './serverInformation';
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
    app.use((request, response, next) => {
        request.workerId = workerId;
        request.catched = false;
        request.serverPath = serverPath;
        request.urlParsed = parse(request.url, true);
        request.pathName = request.urlParsed.pathname;
        request.methodMatch = methodMatch;
        request.isPipeline = isPipeline;
        const stopTimer = httpRequestDurationMicroseconds.startTimer();
        eos(response, () => stopTimer());
        next();
    });
    app.use(metrics(ezs));
    app.use(serverInformation(ezs));
    app.use(unknownPipeline(ezs));
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
    server.setTimeout(0);
    server.listen(serverPort);
    server.addListener('connection', (socket) => {
        const uniqId = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        debug('ezs')('New connection', uniqId);
        httpConnectionTotal.inc();
        httpConnectionOpen.inc();
        socket.on('close', () => {
            httpConnectionOpen.dec();
            debug('ezs')('Connection closed', uniqId);
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
