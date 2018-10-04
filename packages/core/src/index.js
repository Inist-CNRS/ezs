import { PassThrough } from 'stream';
import Engine from './engine';
import Pipeline from './pipeline';
import Dispatch from './dispatch';
import Single from './single';
import Script from './script';
import File from './file';
import Output from './output';
import Cache from './cache';
import Catcher from './catcher';
import Statements from './statements';
import Parameter from './parameter';
import Statement from './statement';
import IsolatedStore from './isolated-store';
import SharedStore from './shared-store';
import { Writer, Reader } from './disk';
import Meta from './meta';
import Server from './server';
import { compressStream, uncompressStream } from './compactor';
import { M_SINGLE, M_DISPATCH, M_NORMAL, HWM_BYTES, HWM_OBJECT, NSHARDS } from './constants';

const ezs = (name, options, environment) => new Engine(ezs, Statement.get(ezs, name, options), options, environment);
const ezsPath = [process.cwd()];

ezs.settings = {
    highWaterMark: [
        HWM_OBJECT,
        HWM_BYTES,
    ],
    nShards: NSHARDS,
};
ezs.objectMode = () => ({
    objectMode: true,
    highWaterMark: Number(ezs.settings.highWaterMark[0]) || HWM_OBJECT,
});
ezs.bytesMode = () => ({
    objectMode: false,
    highWaterMark: Number(ezs.settings.highWaterMark[1]) || HWM_BYTES,
});
ezs.constants = { M_SINGLE, M_DISPATCH, M_NORMAL };
ezs.config = (name, options) => Parameter.set(ezs, name, options);
ezs.pipeline = (commands, environment) => new Pipeline(ezs, commands, environment);
ezs.dispatch = (commands, servers, environment) => new Dispatch(ezs, commands, servers, environment);
ezs.exec = (name, options, environment) => new Engine(ezs, Statement.get(ezs, name, options), options, environment);
ezs.execOnce = (mixed, options, environment) => new Single(ezs, mixed, options, environment);
ezs.metaString = (commands, options) => new Meta(ezs, commands, options);
ezs.metaFile = (filename, options) => new Meta(ezs, File(ezs, filename), options);
ezs.parseString = commands => Script(commands);
ezs.fromString = (commands, environment) => new Pipeline(ezs, Script(commands), environment);
ezs.parseFile = filename => Script(File(ezs, filename));
ezs.fromFile = (filename, environment) => new Pipeline(ezs, Script(File(ezs, filename)), environment);
ezs.catch = func => new Catcher(func);
ezs.toBuffer = options => new Output(options);
ezs.use = plugin => Statement.set(ezs, plugin);
ezs.addPath = p => ezsPath.push(p);
ezs.getPath = () => ezsPath;
ezs.command = (stream, command, environment) => {
    const mode = command.mode || M_NORMAL;
    if (!command.name) {
        throw new Error(`Bad command : ${command.name}`);
    }
    if (mode === M_NORMAL || mode === M_DISPATCH) {
        return stream.pipe(ezs.exec(command.name, command.args, environment));
    }
    if (mode === M_SINGLE || mode === 'single' /* Backward compatibility */) {
        return stream.pipe(ezs.execOnce(command.name, command.args, environment));
    }
    throw new Error(`Bad mode: ${mode}`);
};
ezs.save = (path, options) => new Writer(ezs, path, options);
ezs.load = (path, options) => new Reader(ezs, path, options);
ezs.compress = (options) => compressStream(ezs, options);
ezs.uncompress = (options) => uncompressStream(ezs, options);
ezs.createStream = (options) => new PassThrough(options);

ezs.createCache = (options) => new Cache(ezs, options);
ezs.createServer = (port) => Server.createServer(ezs, new IsolatedStore(), port);
ezs.createCluster = (port) => Server.createCluster(ezs, new SharedStore(), port);

ezs.use(Statements);

module.exports = ezs;

