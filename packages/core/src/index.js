import Engine from './engine';
import Pipeline from './pipeline';
import Dispatch from './dispatch';
import Single from './single';
import Script from './script';
import File from './file';
import Output from './output';
import Catcher from './catcher';
import Plugins from './plugins';
import Parameter from './parameter';
import Statement from './statement';
import IsolatedStore from './isolated-store';
import SharedStore from './shared-store';
import Meta from './meta';
import Server from './server';

const ezs = (name, opts) => new Engine(ezs, Statement.get(ezs, name, opts), opts);
const ezsPath = [process.cwd()];

ezs.config = (name, opts) => Parameter.set(ezs, name, opts);
ezs.pipeline = (commands, options) => new Pipeline(ezs, commands, options);
ezs.dispatch = (commands, options) => new Dispatch(ezs, commands, options);
ezs.all = (name, opts) => new Engine(ezs, Statement.get(ezs, name, opts), opts);
ezs.single = (mixed, options) => new Single(ezs, mixed, options);
ezs.metaString = (commands, options) => new Meta(ezs, commands, options);
ezs.metaFile = (filename, options) => new Meta(ezs, File(ezs, filename), options);
ezs.parseString = commands => Script(commands);
ezs.fromString = (commands, options) => new Pipeline(ezs, Script(commands), options);
ezs.parseFile = filename => Script(File(ezs, filename));
ezs.fromFile = (filename, options) => new Pipeline(ezs, Script(File(ezs, filename)), options);
ezs.with = (selector, name, opts) => new Engine(ezs, Statement.get(ezs, name), opts, selector);
ezs.catch = func => new Catcher(func);
ezs.toBuffer = opts => new Output(opts);
ezs.use = plugin => Statement.set(ezs, plugin);
ezs.addPath = p => ezsPath.push(p);
ezs.getPath = () => ezsPath;
ezs.command = (stream, command) => {
    const mode = command.mode || 'all';
    if (!command.name) {
        throw new Error(`Bad command : ${command.name}`);
    }
    if (mode === 'all' || mode === 'parallel') {
        return stream.pipe(ezs.all(command.name, command.args));
    }
    if (mode === 'with') {
        return stream.pipe(ezs.with(command.test, command.name, command.args));
    }
    if (mode === 'single') {
        return stream.pipe(ezs.single(command.name, command.args));
    }
    throw new Error(`Bad mode: ${mode}`);
};
ezs.createServer = () => Server.createServer(ezs, new IsolatedStore());
ezs.createCluster = () => Server.createCluster(ezs, new SharedStore());

ezs.use(Plugins);

module.exports = ezs;

