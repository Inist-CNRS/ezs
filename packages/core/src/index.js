import Engine from './engine';
import Pipeline from './pipeline';
import Single from './single';
import Script from './script';
import Output from './output';
import Plugins from './plugins';
import Statement from './statement';

const ezs = (name, opts) => new Engine(ezs, Statement.get(ezs, name, opts), opts);

ezs.pipeline = (commands, options) => new Pipeline(ezs, commands, options);
ezs.single = (mixed, options) => new Single(ezs, mixed, options);
ezs.script = (commands, options) => new Pipeline(ezs, Script(commands), options);
ezs.with = (tagname, name, opts) => new Engine(ezs, Statement.get(ezs, name), opts, tagname);
ezs.toBuffer = opts => new Output(opts);
ezs.use = plugin => Statement.set(ezs, plugin);

ezs.use(Plugins);

module.exports = ezs;

