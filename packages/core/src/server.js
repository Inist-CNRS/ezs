import cluster from 'cluster';
import http from 'http';
import {
    DEBUG, PORT, VERSION, NCPUS,
} from './constants';
import Parameter from './parameter';

const signals = ['SIGINT', 'SIGTERM'];

function createServer(ezs, port = PORT) {
    const startedAt = Date.now();
    const server = http
        .createServer((request, response) => {
            const { url, method, headers } = request;
            response.socket.setNoDelay(false);
            if (url === '/' && method === 'POST') {
                try {
                    response.setHeader('Content-Encoding', headers['content-encoding']);
                    const commands = Object.keys(headers)
                        .filter(headerKey => (headerKey.indexOf('x-command') === 0))
                        .map(headerKey => parseInt(headerKey.replace('x-command-', ''), 10))
                        .sort()
                        .map(commandIndex => Parameter.unscramble(headers[`x-command-${commandIndex}`]));
                    const environment = Object.keys(headers)
                        .filter(headerKey => (headerKey.indexOf('x-environment') === 0))
                        .map(headerKey => headerKey.replace('x-environment-', ''))
                        .map(environmentKey => ({
                            [environmentKey]: Parameter.unpack(headers[`x-environment-${environmentKey}`]),
                        }))
                        .reduce((prev, cur) => Object.assign(prev, cur), {});
                    DEBUG(`PID ${process.pid} will execute ${commands.length || 0} commands with ${environment.length || 0} global parameters`);
                    const processor = ezs.pipeline(commands, environment);
                    request
                        .pipe(ezs.uncompress(headers))
                        .pipe(ezs('unpack'))
                        .pipe(ezs('ungroup'))
                        .pipe(processor)
                        .pipe(ezs.catch((error) => {
                            DEBUG('Server has caught an error', error);
                            if (!response.headersSent) {
                                response.writeHead(400, { 'X-Error': Parameter.encode(error.toString()) });
                                response.end();
                            }
                        }))
                        .pipe(ezs((input, output, idx) => {
                            if (idx === 1) {
                                response.writeHead(200);
                            }
                            return output.send(input);
                        }))
                        .pipe(ezs('group'))
                        .pipe(ezs('pack'))
                        .pipe(ezs.compress(headers))
                        .pipe(response);
                    request.resume();
                } catch (error) {
                    DEBUG('Server cannot execute commands', error);
                    response.writeHead(400, { 'X-error': Parameter.encode(error.toString()) });
                    response.end();
                }
            } else if (url === '/' && method === 'GET') {
                const info = {
                    concurrency: NCPUS,
                    uptime: Date.now() - startedAt,
                    timestamp: Date.now(),
                    version: VERSION,
                };
                const responseBody = JSON.stringify(info);
                const responseHeaders = {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(responseBody),
                };
                response.writeHead(200, responseHeaders);
                response.write(responseBody);
                response.end();
            } else {
                response.writeHead(404);
                response.end();
            }
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
