import cluster from 'cluster';
import http from 'http';
import regex from 'filename-regex';
import knownPipeline from './knownPipeline';
import unknownPipeline from './unknownPipeline';
import serverInformation from './serverInformation';
import serverPipeline from './serverPipeline';
import notFound from './notFound';
import Parameter from '../parameter';
import {
    DEBUG, PORT, NCPUS,
} from '../constants';

const isPipeline = filename => (filename.match(regex()).shift() !== undefined);

function createMidddleware(ezs, method, url) {
    DEBUG(`Create middleware for ${method} ${url}`);
    if (method === 'POST' && url === '/') {
        return unknownPipeline(ezs);
    }
    if (method === 'GET' && url === '/') {
        return serverInformation(ezs);
    }
    if (method === 'GET' && isPipeline(url)) {
        return serverPipeline(ezs);
    }
    if (method === 'POST' && isPipeline(url)) {
        return knownPipeline(ezs);
    }
    return notFound();
}

const signals = ['SIGINT', 'SIGTERM'];

function createServer(ezs, port = PORT) {
    const server = http
        .createServer((request, response) => {
            const { url, method } = request;
            response.socket.setNoDelay(false);
            const middleware = createMidddleware(ezs, method, url);
            try {
                middleware(request, response);
            } catch (error) {
                DEBUG('Server cannot execute commands', error);
                response.writeHead(400, { 'X-error': Parameter.encode(error.toString()) });
                response.end();
            }
            return true;
        });
    server.setTimeout(0);
    server.listen(port);
    signals.forEach(signal => process.on(signal, () => {
        DEBUG(`Signal received, stoping server with PID ${process.pid}`);
        server.close(() => process.exit(0));
    }));
    DEBUG(`Server starting with PID ${process.pid} and listening on port ${port}`);
    return server;
}

function createCluster(ezs, port) {
    let term = false;
    if (cluster.isMaster) {
        for (let i = 0; i < NCPUS; i += 1) {
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
