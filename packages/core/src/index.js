import path from 'path';
import { PassThrough } from 'stream';
import pumpify from 'pumpify';
import Cache from './cache';
import Engine from './engine';
import booster from './booster';
import Single from './single';
import Script from './script';
import File from './file';
import Output from './output';
import Catcher from './catcher';
import Statements from './statements';
import Parameter from './parameter';
import Statement from './statement';
import Meta from './meta';
import Server from './server';
import settings from './settings';
import { compressStream, uncompressStream } from './compactor';
import {
    M_SINGLE, M_DISPATCH, M_NORMAL,
} from './constants';


let cacheHandle = null;
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
ezs.fileToServe = file => path.join(settings.servePath, file);
ezs.getCache = () => {
    if (!cacheHandle) {
        cacheHandle = new Cache(settings.cache);
    }
    return cacheHandle;
};
ezs.config = (name, options) => Parameter.set(ezs, name, options);
ezs.pipeline = (commands, environment) => {
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
    return pumpify.obj(streams);
};
ezs.booster = (commands, environment) => booster(ezs, commands, environment);
ezs.exec = (name, options, environment) => new Engine(ezs, Statement.get(ezs, name, options), options, environment);
ezs.execOnce = (mixed, options, environment) => new Single(ezs, mixed, options, environment);
ezs.metaString = (commands, options) => new Meta(ezs, commands, options);
ezs.metaFile = (filename, options) => new Meta(ezs, File(ezs, filename), options);
ezs.parseString = commands => Script(commands);
ezs.fromString = (commands, environment) => ezs.pipeline(Script(commands), environment);
ezs.parseFile = filename => Script(File(ezs, filename));
ezs.fromFile = (filename, environment) => ezs.pipeline(Script(File(ezs, filename)), environment);
ezs.catch = func => new Catcher(func);
ezs.toBuffer = options => new Output(options);
ezs.use = plugin => Statement.set(ezs, plugin);
ezs.addPath = p => ezsPath.push(p);
ezs.getPath = () => ezsPath;
ezs.command = (stream, command, environment) => stream.pipe(ezs.createCommand(command, environment));
ezs.createCommand = (command, environment) => {
    const mode = command.mode || M_NORMAL;
    if (!command.name) {
        throw new Error(`Bad command : ${command.name}`);
    }
    if (mode === M_NORMAL || mode === M_DISPATCH) {
        return ezs.exec(command.name, command.args, environment);
    }
    if (mode === M_SINGLE || mode === 'single' /* Backward compatibility */) {
        return ezs.execOnce(command.name, command.args, environment);
    }
    throw new Error(`Bad mode: ${mode}`);
};
ezs.compress = options => compressStream(ezs, options);
ezs.uncompress = options => uncompressStream(ezs, options);
ezs.createStream = options => new PassThrough(options);

ezs.createServer = port => Server.createServer(ezs, port);
ezs.createCluster = port => Server.createCluster(ezs, port);

ezs.use(Statements);

module.exports = ezs;
