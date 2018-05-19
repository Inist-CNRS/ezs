import os from 'os';
import crypto from 'crypto';
import cluster from 'cluster';
import http from 'http';
import Parameter from './parameter';
import JSONezs from './json';
import config from './config';

const numCPUs = os.cpus().length;

function register(store) {
    function registerCommand(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        const shasum = crypto.createHash('sha1');
        shasum.update(data);
        const cmdid = shasum.digest('hex');
        return store
            .set(cmdid, data)
            .then(() => feed.send(JSON.stringify(cmdid)));
    }
    return registerCommand;
}

function createServer(ezs, store) {
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
                    .pipe(ezs('concat'))
                    .pipe(ezs(register(store)))
                    .pipe(response);
            } else if (url.match(/^\/[a-f0-9]{40}$/i) && method === 'POST') {
                store.get(cmdid).then((cmds) => {
                    let processor;
                    try {
                        const commands = JSONezs.parse(cmds);
                        processor = ezs.pipeline(commands);
                    } catch (e) {
                        console.log(`server cannot execute ${cmdid}`, e);
                        response.writeHead(400);
                        response.end();
                        return;
                    }
                    console.log(`server will execute ${cmdid}`);
                    response.writeHead(200);
                    request
                        .pipe(ezs('decoder'))
                        .pipe(processor)
                        .pipe(ezs.catch(console.error))
                        .pipe(ezs('encoder'))
                        .pipe(response);
                    request.resume();
                });
            } else if (url === '/' && method === 'GET') {
                store.all().then((keys) => {
                    const info = {
                        concurrency: numCPUs,
                        register: keys.length,
                        uptime: Date.now() - startedAt,
                    };
                    const responseBody = JSON.stringify(info);
                    const responseHeaders = {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(responseBody),
                    };
                    response.writeHead(200, responseHeaders);
                    response.write(responseBody);
                    response.end();
                });
            } else {
                response.writeHead(404);
                response.end();
            }
        })
        .listen(config.port);
    // console.log(`PID ${process.pid} listening on 31976`);
    return server;
}

function createCluster(ezs, store) {
    if (cluster.isMaster) {
        for (let i = 0; i < numCPUs; i += 1) {
            cluster.fork();
        }
        cluster.on('exit', () => {
            cluster.fork();
        });
    } else {
        createServer(ezs, store);
    }
    return cluster;
}

export default {
    createServer,
    createCluster,
};
