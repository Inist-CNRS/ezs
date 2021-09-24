import cluster from 'cluster';
import http from 'http';
import controlServer from 'http-shutdown';
import { parse } from 'url';
import debug from 'debug';
import knownPipeline from './knownPipeline';
import identifierPipeline from './identifierPipeline';
import unknownPipeline from './unknownPipeline';
import serverInformation from './serverInformation';
import errorHandler from './errorHandler';
import settings from '../settings';
import { getMetricLogger }  from '../logger'
import { RX_IDENTIFIER, RX_FILENAME } from '../constants';

const isPipeline = (filename) => {
    const f = filename.match(RX_FILENAME);
    return (f && f.shift() !== undefined);
};

const isIdentifier = (filename) => {
    const f = filename.slice(1).match(RX_IDENTIFIER);
    return (f && f.shift() !== undefined);
};

function createMidddleware(ezs, serverPath, method, pathname) {
    if (method === 'POST' && pathname === '/') {
        debug('ezs')(`Create middleware 'unknownPipeline' for ${method} ${pathname}`);
        return unknownPipeline(ezs);
    }
    if (method === 'GET' && pathname === '/') {
        debug('ezs')(`Create middleware 'serverInformation' for ${method} ${pathname}`);
        return serverInformation(ezs, serverPath);
    }
    if (serverPath !== false && isIdentifier(pathname)) {
        debug('ezs')(`Create middleware 'identifierPipeline' for ${method} ${pathname}`);
        return identifierPipeline(ezs, serverPath);
    }
    if (serverPath !== false && isPipeline(pathname)) {
        debug('ezs')(`Create middleware 'knownPipeline' for ${method} ${pathname}`);
        return knownPipeline(ezs, serverPath);
    }
    const error = new Error(`Unable to create middleware for ${method} ${pathname}`);
    return (request, response) => errorHandler(request, response)(error, 404);
}

const signals = ['SIGINT', 'SIGTERM'];

let serverCounter = 0;
let connectionCounter = 0;
let connectionNumber = 0;
function createServer(ezs, serverPort, serverPath) {
    const logger = getMetricLogger('error', `PID ${process.pid}`);
    const server = controlServer(http
        .createServer((request, response) => {
            const { method } = request;
            response.socket.setNoDelay(false);
            request.url = parse(request.url, true);
            const middleware = createMidddleware(ezs, serverPath, method, request.url.pathname);
            try {
                middleware(request, response);
            } catch (error) {
                errorHandler(request, response)(error);
            }
            return true;
        }));
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
    logger('ezs_server_server', serverCounter);
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
