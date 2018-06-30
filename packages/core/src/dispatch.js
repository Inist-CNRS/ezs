import { PassThrough, Duplex } from 'stream';
import { compressStream, decompressStream } from 'node-zstd';
import assert from 'assert';
import http from 'http';
import pMap from 'p-map';
import MultiStream from 'multistream';
import Parameter from './parameter';
import { DEBUG, PORT } from './constants';

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
        port: Number(PORT),
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
                        agent,
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
            .pipe(ezs('jsonnd'))
            .pipe(compressStream())
            .pipe(req);
        commands.forEach(command => input.write(command));
        input.end();
    });

const duplexer = (ezs, onerror) => (serverOptions, index) => {
    const input = new PassThrough({ objectMode: true });
    const output = new PassThrough({ objectMode: true });
    const handle = http.request(serverOptions, (res) => {
        if (res.statusCode === 200) {
            res
                .pipe(decompressStream())
                .pipe(ezs('ndjson'))
                .on('data', chunk => output.write(chunk))
                .on('end', () => output.end());
        } else {
            onerror(new Error(
                `${serverOptions.hostname}:${serverOptions.port} return ${res.statusCode}`,
            ));
            output.end();
        }
    });
    handle.on('error' , (e) => {
        onerror(e);
        output.end();
    })
    const inp = input
        .pipe(ezs('jsonnd'))
        .pipe(compressStream())
        .pipe(handle);
    const duplex = [input, output];
    return duplex;
};

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
                    handle[0].end();
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
        this.ezs = ezs;
    }

    _write(chunk, encoding, callback) {
        if (this.semaphore) {
            this.semaphore = false;
            pMap(this.servers, server =>
                registerTo(this.ezs, server, this.commands).catch((e) => {
                    DEBUG(`Unable to regsister commands with the server: ${server}`, e);
                }),
            ).then((workers) => {
                this.handles = workers.map(duplexer(this.ezs, (e) => {
                    this.emit('error', e);
                }));
                const streams = this.handles.map(h => h[1]);
                MultiStream(streams, { objectMode: true }).pipe(this.tubin);
                this.balance(chunk, encoding, callback);
            }, callback).catch(console.error);
        } else {
            this.balance(chunk, encoding, callback);
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
        this.handles[this.lastIndex][0].write(
            chunk,
            encoding,
            callback,
        );
    }
}
