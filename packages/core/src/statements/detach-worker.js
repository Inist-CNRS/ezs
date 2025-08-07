import { workerData } from 'worker_threads';
import { pipeline } from 'stream';
import process from 'process';
import ezs from '../index.js';
import JSONezs from '../json.js';

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
} = workerData;

const command = JSONezs.parse(commandString);
const commands = JSONezs.parse(commandsString);

ezs.settings = settings;
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
statements.unshift(ezs.createCommand(workerData.decoder));
statements.push(ezs.createCommand(workerData.encoder));

const rawStream = ezs.createStream(ezs.bytesMode);

const outputStream = ezs.createStream();
outputStream.pipe(process.stdout);

const transformedStream = ezs.createPipeline(rawStream, statements, logger)
    .once('unpipe', () => {
        process.stdin.unpipe(rawStream);
        rawStream.end();
    })
    .pipe(ezs.catch())
    .once('error', (e) => {
        console.error(e);
        outputStream.unpipe(process.stdout);
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
            outputStream.unpipe(process.stdout);
            process.exit(1);
        }
    }
);

process.stdin
    .once('aborted', () => {
        process.stdin.unpipe(rawStream);
        rawStream.end();
    })
    .once('error', (e) => {
        process.stdin.unpipe(rawStream);
        rawStream.end();
        process.exit(1);
    })
    .once('end', () => {
        rawStream.end();
    });
process.stdin.pipe(rawStream);
process.stdin.resume();
