import { PassThrough } from 'readable-stream';
import http from 'http';
import debug from 'debug';
import Parameter from './parameter';
import settings from './settings';

export const agent = new http.Agent({
    maxSockets: 0,
    keepAlive: false,
    timeout: 0,
});

export const parseAddress = (commands, environment) => (srvr) => {
    if (typeof srvr !== 'string') {
        return null;
    }
    const hostWithPort = srvr.match(/^\[?([^\]]+)\]?:(\d+)$/);
    const serverOptions = {
        hostname: srvr,
        port: settings.port,
        path: '/',
        method: 'POST',
        headers: {
            'Transfer-Encoding': 'chunked',
            'Content-Type': 'application/json',
        },
        agent,
    };
    commands
        .filter(Boolean)
        .forEach((command, index) => {
            serverOptions.headers[`X-Command-${index}`] = Parameter.pack(command);
        });
    Object.keys(environment)
        .filter((keyEnv) => environment[keyEnv])
        .forEach((keyEnv, index) => {
            serverOptions.headers[`X-Environment-${index}`] = Parameter.pack({ k: keyEnv, v: environment[keyEnv] });
        });
    if (hostWithPort) {
        return {
            ...serverOptions,
            hostname: hostWithPort[1],
            port: Number(hostWithPort[2]),
        };
    }
    return serverOptions;
};

export const ensureArray = (a) => (Array.isArray(a) ? a : [a]);

export const inspectServers = (servers, commands, environment, ns) => ensureArray(servers)
    .filter(Boolean)
    .filter((elem, pos, arr) => arr.indexOf(elem) === pos)
    .map(parseAddress(commands, environment))
    .map((s) => Array(ns || settings.concurrency).fill(s)) // multiple each line
    .reduce((a, b) => a.concat(b), []); // flatten all

export const connectServer = (ezs) => (serverOptions, index) => {
    const { hostname, port } = serverOptions;
    let connected = false;
    serverOptions.headers = {
        ...ezs.encodingMode(),
        ...serverOptions.headers,
    };
    const input = new PassThrough(ezs.objectMode());
    const output = new PassThrough(ezs.objectMode());
    const handle = http.request(serverOptions, (res) => {
        connected = true;
        debug('ezs:info')(`http://${hostname}:${port} send code ${res.statusCode}`);
        if (res.statusCode === 200) {
            res
                .pipe(ezs.uncompress(res.headers))
                .pipe(ezs('unpack'))
                .pipe(ezs('ungroup'))
                .pipe(output);
            return 1;
        }
        if (res.statusCode === 500) {
            const errmsg = Parameter.decode(res.headers['x-error']);
            output.write(new Error(`Server sent: ${errmsg}`));
            output.end();
            return 2;
        }
        output.write(new Error(
            `http://${hostname}:${port} at item #${index} return ${res.statusCode}`,
        ));
        return 3;
    });
    handle.on('error', (e) => {
        handle.abort();
        if (!connected) {
            output.write(new Error(
                `http://${hostname || '?'}:${port || '?'} at item #${index} return ${e.message}`,
            ));
            return output.end();
        }
        debug('ezs:info')(`http://${hostname}:${port} was stopped properly following`, ezs.serializeError(e));
        return 4;
    });
    handle.setNoDelay(false);

    input
        .pipe(ezs('group'))
        .pipe(ezs('pack'))
        .pipe(ezs.compress(ezs.encodingMode()))
        .pipe(handle);
    const duplex = [input, output];
    return duplex;
};
