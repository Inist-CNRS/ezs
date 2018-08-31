import os from 'os';
import crypto from 'crypto';
import cluster from 'cluster';
import http from 'http';
import { DEBUG, PORT, VERSION, NCPUS } from './constants';
import Parameter from './parameter';
import JSONezs from './json';

const signals = ['SIGINT', 'SIGTERM'];

function receive(data, feed) {
    if (!this.commands) {
        this.commands = [];
    }
    if (this.isLast()) {
        feed.write(JSON.stringify(this.commands));
        return feed.close();
    }
    this.commands.push(data);
    feed.end();
}

function register(store) {
    function registerCommand(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        const shasum = crypto.createHash('sha1');
        shasum.update(data);
        const cmdid = shasum.digest('hex');
        store
            .set(cmdid, data)
            .then(() => {
                try {
                    const id = JSON.stringify(cmdid);
                    feed.send(id);
                } catch (error) {
                    feed.send(error);
                }
            }, error => {
                feed.send(error);
            });
    }
    return registerCommand;
}

function createServer(ezs, store, port) {
    const startedAt = Date.now();
    const server = http
        .createServer((request, response) => {
            const { url, method, headers } = request;
            const cmdid = url.slice(1);
            if (url === '/' && method === 'POST') {
                if (headers['x-parameter']) {
                    const parameters = Parameter.unpack(headers['x-parameter']);
                    Parameter.put(ezs, parameters);
                }
                request
                    .pipe(ezs.uncompress())
                    .pipe(ezs('unpack'))
                    .pipe(ezs(receive))
                    .pipe(ezs(register(store)))
                    .pipe(ezs.catch(error => {
                        DEBUG(`The server has detected an error while registering statements`, error);
                        return;
                    }))
                    .pipe(response);
            } else if (url.match(/^\/[a-f0-9]{40}$/i) && method === 'POST') {
                store.get(cmdid).then((cmds) => {
                    let processor;
                    try {
                        const commands = JSONezs.parse(cmds);
                        processor = ezs.pipeline(commands);
                    } catch (e) {
                        DEBUG(`Server cannot execute statements with ID: ${cmdid}`, e);
                        response.writeHead(400);
                        response.end();
                        return;
                    }
                    DEBUG(`Server will execute statements with ID: ${cmdid}`);
                    response.writeHead(200);
                    request
                        .pipe(ezs.uncompress())
                        .pipe(ezs('unpack'))
                        .pipe(processor)
                        .pipe(ezs.catch(error => {
                            DEBUG(`Server has caught an error in statements with ID: ${cmdid}`, error);
                            return;
                        }))
                        .pipe(ezs('pack'))
                        .pipe(ezs.compress())
                        .pipe(response);
                    request.resume();
                }, error => {
                    DEBUG(`Server failed to load statements with ID: ${cmdid}`, error);
                        response.writeHead(500);
                        response.end();
                        return;
                });
            } else if (url === '/' && method === 'GET') {
                store.size().then((size) => {
                    const info = {
                        concurrency: NCPUS,
                        register: size,
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
                }, error => {
                    DEBUG(`Server failed to compute statistics`, error);
                        response.writeHead(500);
                        response.end();
                        return;
                });
            } else {
                response.writeHead(404);
                response.end();
            }
        })
        .listen(port || PORT);
    signals.forEach(signal => process.on(signal, () => {
        DEBUG(`Signal received, stoping server with PID ${process.pid}`);
        server.close(() => process.exit(0));
    }));
    DEBUG(`Server starting with PID ${process.pid} and listening on port ${port}`);
    return server;
}

function createCluster(ezs, store, port) {
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
        createServer(ezs, store, port);
    }
    return cluster;
}

export default {
    createServer,
    createCluster,
};
