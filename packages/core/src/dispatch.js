import { PassThrough, Duplex } from 'stream';
import { compressStream, decompressStream } from 'node-zstd';
import Decoder from 'ld-jsonstream';
import assert from 'assert';
import http from 'http';
import pMap from 'p-map';
import mergeStream from 'merge-stream';
import Parameter from './parameter';
import config from './config';
import { DEBUG } from './constants';

const parseAddress = (srvr) => {
    if (typeof srvr !== 'string') {
        return null;
    }
    const hostWithPort = srvr.match(/^\[?([^\]]+)\]?:(\d+)$/);
    if (hostWithPort) {
        return {
            hostname: hostWithPort[1],
            port: Number(hostWithPort[2]),
        };
    }
    return {
        hostname: srvr,
        port: Number(config.port),
    };
};
const agent = new http.Agent({
    maxSockets: 1000,
    keepAlive: true,
    timeout: 100,
});

const registerTo = (ezs, { hostname, port }, commands) =>
    new Promise((resolve, reject) => {
        const requestOptions = {
            hostname,
            port,
            path: '/',
            method: 'POST',
            headers: {
                'Transfer-Encoding': 'chunked',
                'Content-Type': 'application/json',
                'X-Parameter': Parameter.pack(),
            },
            agent,
        };
        DEBUG(`Try to connect to server ${hostname}:${port}`);
        const req = http.request(requestOptions, (res) => {
            let requestResponse = '';
            res.setEncoding('utf8');
            res.on('error', (error) => {
                reject(error);
            });
            res.on('data', (chunk) => {
                requestResponse += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(requestResponse);
                    DEBUG(
                        `The server has registered all statements with ID: ${result}`,
                    );
                    resolve({
                        hostname,
                        port,
                        path: `/${result}`,
                        method: 'POST',
                        headers: {
                            'Transfer-Encoding': 'chunked',
                            'Content-Type': ' application/json',
                        },
                        //agent,
                    });
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', (e) => {
            reject(e);
        });
        const input = new PassThrough({ objectMode: true });
        input
            .pipe(ezs('encoder'))
            .pipe(compressStream())
            .pipe(req);
        commands.forEach(command => input.write(command));
        input.end();
    });

const connectTo = (ezs, serverOptions, funnel) =>
    new Promise((resolve, reject) => {
        const handle = http.request(serverOptions, (res) => {
            if (res.statusCode === 200) {
                const ret = res
                    .pipe(decompressStream())
                    .pipe(new Decoder())
                funnel.add(ret);
            } else {
                funnel.emit('error', new Error(
                    `${serverOptions.hostname}:${serverOptions.port} return ${res.statusCode}`,
                ));
            }
        });
        handle.on('socket', () => {
            const input = new PassThrough({ objectMode: true });
            input
                .pipe(ezs('encoder'))
                .pipe(compressStream())
                .pipe(handle);
            resolve(input);
        });
        handle.on('error', (e) => {
            funnel.emit('error', e);
            reject(e);
        });
    });

export default class Dispatch extends Duplex {
    constructor(ezs, commands, servers) {
        super({ objectMode: true });

        this.handles = [];
        this.handlesEnd = [];

        this.tubin = new PassThrough({ objectMode: true });
        this.tubout = this.tubin
            .pipe(ezs('transit'))
        ;

        this.on('finish', () => {
            this.handles.forEach((handle, index) => {
                if (!this.handlesEnd[index]) {
                    handle.end();
                }
            });
        });
        this.tubout.on('data', (chunk, encoding) => {
            this.push(chunk, encoding);
        });
        this.tubout.on('finish', () => {
            this.push(null);
        });
        this.tubout.on('error', (e) => {
            DEBUG('Unlikely error', e);
        });
        this.tubout.pause();

        assert(Array.isArray(commands), 'commands should be an array.');
        assert(Array.isArray(servers), 'servers should be an array.');

        this.servers = servers.map(parseAddress).filter(x => x);
        this.commands = commands;
        this.semaphore = true;
        this.lastIndex = 0;
        this.funnel = mergeStream();
        this.funnel.on('error', (e) => {
            this.emit('error', e);
        });
        this.funnel.pipe(this.tubin);
        this.ezs = ezs;
    }

    _write(chunk, encoding, callback) {
        const self = this;
        if (self.semaphore) {
            self.semaphore = false;
            pMap(self.servers, server =>
                registerTo(this.ezs, server, self.commands).catch((e) => {
                    DEBUG(`Unable to regsister commands with the server: ${server}`, e);
                }),
            ).then((workers) => {
                pMap(workers, worker => connectTo(self.ezs, worker, self.funnel))
                    .then((handles) => {
                        self.handles = handles;
                        self.handles.forEach((h, i) => h.on('finish', () => { self.handlesEnd[i] = true; }));
                        self.balance(chunk, encoding, callback);
                    }, callback);
            }, callback);
        } else {
            self.balance(chunk, encoding, callback);
        }
    }

    _read(size) {
        this.lastSize = size;
        if (this.tubout.isPaused()) {
            this.tubout.resume();
        }
    }

    balance(chunk, encoding, callback) {
        this.lastIndex += 1;
        if (this.lastIndex >= this.handles.length) {
            this.lastIndex = 0;
        }
        this.handles[this.lastIndex].write(
            chunk,
            encoding,
            callback,
        );
    }
}
