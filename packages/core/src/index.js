import { PassThrough } from 'stream';
import writeTo from 'stream-write';
import globalModules from 'global-modules';
import { resolve } from 'path';
import LRU from 'lru-cache';
import Engine from './engine';
import Script, { parseCommand } from './script';
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

const onlyOne = (item) => (Array.isArray(item) ? item.shift() : item);

const ezs = (name, options, environment) => new Engine(ezs, Statement.get(ezs, name, options), options, environment);
const ezsPath = [resolve(__dirname, '../..'), process.cwd(), globalModules];
const ezsCache = new LRU(settings.cache);

ezs.memoize = (key, func) => {
    if (!key || !settings.cacheEnable) {
        return func();
    }
    const cached = ezsCache.get(key);
    if (cached) {
        return cached;
    }
    const tocache = func();
    if (tocache) {
        ezsCache.set(key, tocache);
    }
    return tocache;
};
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
ezs.metaString = (commands, options) => ezs.memoize(`ezs.metaFile>${commands}`, () => new Meta(ezs, commands, options));
ezs.metaFile = (filename, options) => ezs.memoize(`ezs.metaFile>${filename}`, () => new Meta(ezs, ezs.loadScript(filename), options));
ezs.parseString = (commands) => Script(commands);
ezs.parseFile = (filename) => Script(ezs.loadScript(filename));
ezs.catch = (func) => new Catcher(func);
ezs.toBuffer = (options) => new Output(options);
ezs.use = (plugin) => Statement.set(ezs, plugin);
ezs.addPath = (p) => ezsPath.push(p);
ezs.getPath = () => ezsPath;
ezs.loadScript = (file) => ezs.memoize(`ezs.loadScript>${file}`, () => File(ezs, file));
ezs.compileScript = (script) => new Commands(ezs.parseString(script));
ezs.parseCommand = (command) => ezs.memoize(`ezs.parseCommand>${command}`, () => parseCommand(command));
ezs.createCommand = (command, environment) => {
    if (!command.name) {
        throw new Error(`Bad command : ${command.name}`);
    }
    if (command.use) {
        Statement.load(ezs, command.use);
    }
    if (Statement.exists(ezs, command.mode)) {
        return ezs(command.mode, { commands: [{ name: command.name, args: command.args }] }, environment);
    }
    return ezs(command.name, command.args, environment);
};
ezs.compileCommands = (commands, environment) => {
    if (!Array.isArray(commands)) {
        throw new Error('Pipeline works with an array of commands.');
    }
    const cmds = [...commands];
    const streams = cmds.map((command) => ezs.createCommand(command, environment));
    if (streams.length === 0) {
        return [new PassThrough(ezs.objectMode())];
    }
    return streams;
};
ezs.createCommands = (params) => {
    const { file } = params;
    const fileContent = ezs.loadScript(file);
    const { script = fileContent } = params;
    const cmd1 = ezs.compileScript(script).get();
    const { command } = params;
    const cmd2 = [].concat(command).map(ezs.parseCommand).filter(Boolean);
    const { commands = cmd1.concat(cmd2) } = params;
    const { prepend, append } = params;
    const prepend2Pipeline = ezs.parseCommand(onlyOne(prepend));
    const append2Pipeline = ezs.parseCommand(onlyOne(append));
    if (prepend2Pipeline) {
        commands.unshift(prepend2Pipeline);
    }
    if (append2Pipeline) {
        commands.push(append2Pipeline);
    }
    if (!commands || commands.length === 0) {
        throw new Error('Invalid parmeter for createCommands');
    }
    return commands;
};
ezs.writeTo = writeTo;
ezs.createPipeline = (input, commands) => commands.reduce((amont, aval) => amont.pipe(aval), input);
ezs.compress = (options) => compressStream(ezs, options);
ezs.uncompress = (options) => uncompressStream(ezs, options);
ezs.createStream = (options) => new PassThrough(options);
ezs.createServer = (port, path) => Server.createServer(ezs, port, path);
ezs.createCluster = (port, path) => Server.createCluster(ezs, port, path);

ezs.use(Statements);

module.exports = ezs;
