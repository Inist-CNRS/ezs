import { workerData, parentPort } from 'worker_threads';
import { pipeline } from 'stream';
import process from 'process';
import ezs from '@ezs/core';
import JSONezs from '@ezs/core/json';
import { PassThrough } from 'stream';
import { randomUUID } from 'crypto';
import os from 'os';
import net from 'net';
import path from 'path';
import fs from 'fs';


const {
    file,
    script,
    commandString,
    commandsString,
    prepend,
    append,
    encoder, // default pack
    decoder, // default unpack
    environment,
    loggerParam,
    settings,
    plugins,
} = workerData;


const stdin = new PassThrough();
const stdout = new PassThrough();

const uid = randomUUID();
const socketIn  = path.join(os.tmpdir(), `worker-stdin-${uid}.sock`);
const socketOut = path.join(os.tmpdir(), `worker-stdout-${uid}.sock`);

// Nettoyage si les sockets existent déjà
if (fs.existsSync(socketIn))  fs.unlinkSync(socketIn);
if (fs.existsSync(socketOut)) fs.unlinkSync(socketOut);


const createServer = (socketPath, onConnection) => new Promise((resolve) => {
    const server = net.createServer(onConnection);
    server.listen(socketPath, () => resolve(server));
});


const [stdinServer, stdoutServer] = await Promise.all([
  createServer(socketIn,  (socket) => { socket.pipe(stdin); }),
  createServer(socketOut, (socket) => { stdout.pipe(socket); }),
]);

parentPort.postMessage({ socketIn, socketOut });


process.on('exit', () => {
    stdinServer.close();
    stdoutServer.close();
    if (fs.existsSync(socketIn))  fs.unlinkSync(socketIn);
    if (fs.existsSync(socketOut)) fs.unlinkSync(socketOut);
});

const command = JSONezs.parse(commandString);
const commands = JSONezs.parse(commandsString);

ezs.settings = settings;
ezs.useFiles(plugins);
const commandsCreated = ezs.createCommands({
    file,
    script,
    command,
    commands,
    prepend,
    append,
});
const statements = ezs.compileCommands(commandsCreated, environment);
const logger = ezs.createTrap(loggerParam, environment);
statements.unshift(ezs.createCommand(decoder));
statements.push(ezs.createCommand(encoder));

const rawStream = ezs.createStream(ezs.bytesMode);

const outputStream = ezs.createStream();
outputStream.pipe(stdout);

const transformedStream = ezs.createPipeline(rawStream, statements, logger)
    .once('unpipe', () => {
        stdin.unpipe(rawStream);
        rawStream.end();
    })
    .pipe(ezs.catch())
    .once('error', (e) => {
        console.error(e);
        outputStream.unpipe(stdout);
        rawStream.destroy();
        transformedStream.destroy();
        process.exit(1);
    });

pipeline(
    transformedStream,
    ezs.toBuffer(),
    outputStream,
    (e) => {
        if (e) {
            console.error(e);
            outputStream.unpipe(stdout);
            process.exit(1);
        }
    }
);

stdin
    .once('aborted', () => {
        stdin.unpipe(rawStream);
        rawStream.end();
    })
    .once('error', (e) => {
        stdin.unpipe(rawStream);
        rawStream.end();
        process.exit(1);
    })
    .once('end', () => {
        rawStream.end();
    });
stdin.pipe(rawStream);
stdin.resume();
