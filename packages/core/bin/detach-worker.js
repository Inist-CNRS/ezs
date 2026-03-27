import { workerData } from 'worker_threads';
import { pipeline } from 'stream';
import process from 'process';
import ezs from '@ezs/core';
import JSONezs from '@ezs/core/json';
import { Readable, Writable } from 'stream';

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
    stdinPort,
    stdoutPort,
} = workerData;


const stdin = new Readable({ read() {} });
stdinPort.on('message', ({ type, chunk }) => {
    if (type === 'data')  stdin.push(Buffer.from(chunk));
    else if (type === 'end')   stdin.push(null);
    else if (type === 'error') stdin.destroy(new Error(chunk));
});

// Remplace process.stdout
const stdout = new Writable({
    write(chunk, _encoding, callback) {
        stdoutPort.postMessage({ type: 'data', chunk });
        callback();
    },
    final(callback) {
        stdoutPort.postMessage({ type: 'end' });
        callback();
    }
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
