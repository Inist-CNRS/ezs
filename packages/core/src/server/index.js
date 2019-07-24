import cluster from 'cluster';
import http from 'http';
import controlServer from 'http-shutdown';
import regex from 'filename-regex';
import { parse } from 'url';
import debug from 'debug';
import knownPipeline from './knownPipeline';
import unknownPipeline from './unknownPipeline';
import serverInformation from './serverInformation';
import errorHandler from './errorHandler';
import settings from '../settings';

const isPipeline = (filename) => {
    const f = filename.match(regex());
    return (f && f.shift() !== undefined);
};

function createMidddleware(ezs, path, method, pathname) {
    if (path === false && method === 'POST' && pathname === '/') {
        debug('ezs')(`Create middleware 'unknownPipeline' for ${method} ${pathname}`);
        return unknownPipeline(ezs);
    }
    if (method === 'GET' && pathname === '/') {
        debug('ezs')(`Create middleware 'serverInformation' for ${method} ${pathname}`);
        return serverInformation(ezs);
    }
    if (path !== false && isPipeline(pathname)) {
        debug('ezs')(`Create middleware 'knownPipeline' for ${method} ${pathname}`);
        return knownPipeline(ezs);
    }
    const error = new Error(`Unable to create middleware for ${method} ${pathname}`);
    return (request, response) => errorHandler(request, response)(error, 404);
}

const signals = ['SIGINT', 'SIGTERM'];

function createServer(ezs, serverPort, serverPath) {
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
    signals.forEach(signal => process.on(signal, () => {
        debug('ezs')(`Signal received, stoping server with PID ${process.pid}`);
        server.shutdown(() => process.exit(0));
    }));
    debug('ezs')(`Server starting with PID ${process.pid} and listening on port ${serverPort}`);
    return server;
}

function createCluster(ezs, serverPort, serverPath) {
    let term = false;
    if (cluster.isMaster) {
        for (let i = 0; i < settings.nShards; i += 1) {
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
                Object.keys(cluster.workers).forEach(id => cluster.workers[id].kill());
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
