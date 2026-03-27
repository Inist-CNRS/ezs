import { workerData, parentPort } from 'worker_threads';
import { pipeline } from 'stream';
import process from 'process';
import ezs from '@ezs/core';
import JSONezs from '@ezs/core/json';
import { PassThrough } from 'stream';
import net from 'net';


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
const stdinServer = net.createServer((socket) => {
  socket.pipe(stdin);
});
const stdout = new PassThrough();
const stdoutServer = net.createServer((socket) => {
    stdout.pipe(socket);
});

stdinServer.listen(0, '127.0.0.1', () => {
  const { port: stdinPort } = stdinServer.address();

    stdoutServer.listen(0, '127.0.0.1', () => {
        const { port: stdoutPort } = stdoutServer.address();
        parentPort.postMessage({ stdinPort, stdoutPort });
    });
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
