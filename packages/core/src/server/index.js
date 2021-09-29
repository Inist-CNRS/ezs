import connect from 'connect';
import cluster from 'cluster';
import http from 'http';
import controlServer from 'http-shutdown';
import { parse } from 'url';
import debug from 'debug';
import knownPipeline from './knownPipeline';
import unknownPipeline from './unknownPipeline';
import serverInformation from './serverInformation';
import errorHandler from './errorHandler';
import settings from '../settings';
import { getMetricLogger }  from '../logger';
import { RX_FILENAME } from '../constants';

function isPipeline() {
    const f = this.pathName.match(RX_FILENAME);
    return (f && f.shift() !== undefined);
}

function methodMatch(values) {
    return (values.indexOf(this.method) !== -1);
}

const signals = ['SIGINT', 'SIGTERM'];

let serverCounter = 0;
let connectionCounter = 0;
let connectionNumber = 0;
function createServer(ezs, serverPort, serverPath) {
    const app = connect();
    app.use((request, response, next) => {
        request.catched = false;
        request.serverPath = serverPath;
        request.urlParsed = parse(request.url, true)
        request.pathName = request.urlParsed.pathname;
        request.methodMatch = methodMatch;
        request.isPipeline = isPipeline;
        next();
    });
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
        errorHandler(request, response)(error, 500);
        next();
    });
    const logger = getMetricLogger('server', `PID${process.pid}`);
    const server = controlServer(http.createServer(app));
    server.setTimeout(0);
    server.listen(serverPort);
    server.addListener('connection', (socket) => {
        const uniqId = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        debug('ezs')('New connection', uniqId);
        connectionCounter += 1;
        connectionNumber += 1;
        logger('ezs_server_connections_counter', connectionCounter);
        logger('ezs_server_connections_number', connectionNumber);
        socket.on('close', () => {
            connectionNumber -= 1;
            logger('ezs_server_connections_number', connectionNumber);
            debug('ezs')('Connection closed', uniqId);
        });
    });
    signals.forEach((signal) => process.on(signal, () => {
        debug('ezs')(`Signal received, stoping server with PID ${process.pid}`);
        server.shutdown(() => process.exit(0));
    }));
    debug('ezs')(`Server starting with PID ${process.pid} and listening on port ${serverPort}`);
    serverCounter += 1;
    logger('ezs_server_counter', serverCounter);
    return server;
}

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
        signals.forEach((signal) => {
            process.on(signal, () => {
                term = true;
                Object.keys(cluster.workers).forEach((id) => cluster.workers[id].kill());
            });
        });
    } else {
        createServer(ezs, serverPort, serverPath);
    }
    return cluster;
}

export default {
    createServer,
    createCluster,
};
