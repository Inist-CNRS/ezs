import { PassThrough } from 'stream';
import writeTo from 'stream-write';
import Engine from './engine';
import Script from './script';
import File from './file';
import Output from './output';
import Commands from './commands';
import Catcher from './catcher';
import Statements from './statements';
import Statement from './statement';
import Meta from './meta';
import Server from './server';
import settings from './settings';
import { compressStream, uncompressStream } from './compactor';
import {
    M_SINGLE, M_DISPATCH, M_NORMAL,
} from './constants';


const ezs = (name, options, environment) => new Engine(ezs, Statement.get(ezs, name, options), options, environment);
const ezsPath = [process.cwd()];

ezs.settings = settings;
ezs.objectMode = () => ({
    objectMode: true,
    highWaterMark: settings.highWaterMark.object,
});
ezs.bytesMode = () => ({
    objectMode: false,
    highWaterMark: ezs.settings.highWaterMark.bytes,
});
ezs.encodingMode = () => ({
    'Content-Encoding': settings.encoding,
});
ezs.metaString = (commands, options) => new Meta(ezs, commands, options);
ezs.metaFile = (filename, options) => new Meta(ezs, File(ezs, filename), options);
ezs.parseString = commands => Script(commands);
ezs.parseFile = filename => Script(File(ezs, filename));
ezs.catch = func => new Catcher(func);
ezs.toBuffer = options => new Output(options);
ezs.use = plugin => Statement.set(ezs, plugin);
ezs.addPath = p => ezsPath.push(p);
ezs.getPath = () => ezsPath;
ezs.loadScript = file => File(ezs, file);
ezs.compileScript = script => new Commands(ezs.parseString(script));
ezs.createCommand = (command, environment) => {
    const mode = command.mode || M_NORMAL;
    if (!command.name) {
        throw new Error(`Bad command : ${command.name}`);
    }
    if (command.use) {
        Statement.load(ezs, command.use);
    }
    if (mode === M_NORMAL || mode === M_DISPATCH) {
        return ezs(command.name, command.args, environment);
    }
    if (mode === M_SINGLE || mode === 'single' /* Backward compatibility */) {
        return ezs('singleton', { ...command.args, statement: command.name }, environment);
    }
    throw new Error(`Bad mode: ${mode}`);
};
ezs.compileCommands = (commands, environment) => {
    if (!Array.isArray(commands)) {
        throw new Error('Pipeline works with an array of commands.');
    }
    const cmds = [...commands];
    cmds.push({
        mode: M_NORMAL,
        name: 'transit',
        args: { },
    });
    const streams = cmds.map(command => ezs.createCommand(command, environment));
    if (streams.length === 1) {
        return new PassThrough(ezs.objectMode());
    }
    return streams;
};
ezs.writeTo = writeTo;
ezs.createPipeline = (input, streams) => streams.reduce((amont, aval) => amont.pipe(aval), input);
ezs.compress = options => compressStream(ezs, options);
ezs.uncompress = options => uncompressStream(ezs, options);
ezs.createStream = options => new PassThrough(options);
ezs.createServer = (port, path) => Server.createServer(ezs, port, path);
ezs.createCluster = (port, path) => Server.createCluster(ezs, port, path);

ezs.use(Statements);

module.exports = ezs;
