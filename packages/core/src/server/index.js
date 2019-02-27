import cluster from 'cluster';
import http from 'http';
import controlServer from 'http-shutdown';
import regex from 'filename-regex';
import { parse } from 'url';
import knownPipeline from './knownPipeline';
import unknownPipeline from './unknownPipeline';
import serverInformation from './serverInformation';
import serverPipeline from './serverPipeline';
import notFound from './notFound';
import Parameter from '../parameter';
import settings from '../settings';
import { DEBUG } from '../constants';

const isPipeline = filename => (filename.match(regex()).shift() !== undefined);

function createMidddleware(ezs, method, pathname) {
    if (method === 'POST' && pathname === '/') {
        DEBUG(`Create middleware 'unknownPipeline' for ${method} ${pathname}`);
        return unknownPipeline(ezs);
    }
    if (method === 'GET' && pathname === '/') {
        DEBUG(`Create middleware 'serverInformation' for ${method} ${pathname}`);
        return serverInformation(ezs);
    }
    if (method === 'GET' && isPipeline(pathname)) {
        DEBUG(`Create middleware 'serverPipeline' for ${method} ${pathname}`);
        return serverPipeline(ezs);
    }
    if (method === 'POST' && isPipeline(pathname)) {
        DEBUG(`Create middleware 'knownPipeline' for ${method} ${pathname}`);
        return knownPipeline(ezs);
    }
    DEBUG(`Create middleware 'notFound' for ${method} ${pathname}`);
    return notFound();
}

const signals = ['SIGINT', 'SIGTERM'];

function createServer(ezs, port) {
    const server = controlServer(http
        .createServer((request, response) => {
            const { method } = request;
            response.socket.setNoDelay(false);
            request.url = parse(request.url, true);
            const middleware = createMidddleware(ezs, method, request.url.pathname);
            try {
                middleware(request, response);
            } catch (error) {
                DEBUG('Server cannot execute commands', error);
                response.writeHead(400, { 'X-error': Parameter.encode(error.toString()) });
                response.end();
            }
            return true;
        }));
    server.setTimeout(0);
    server.listen(port || settings.port);
    signals.forEach(signal => process.on(signal, () => {
        DEBUG(`Signal received, stoping server with PID ${process.pid}`);
        server.shutdown(() => process.exit(0));
    }));
    DEBUG(`Server starting with PID ${process.pid} and listening on port ${port}`);
    return server;
}

function createCluster(ezs, port) {
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
        createServer(ezs, port);
    }
    return cluster;
}

export default {
    createServer,
    createCluster,
};
