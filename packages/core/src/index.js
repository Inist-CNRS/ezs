import Engine from './engine';
import Pipeline from './pipeline';
import Once from './once';
import Script from './script';
import Tag from './tag';
import Output from './output';
import Plugins from './plugins';
import Statement from './statement';

const ezs = (name, opts) => new Engine(ezs, Statement.get(ezs, name, opts), opts);

ezs.pipeline = (commands, options) => new Pipeline(ezs, commands, options);
ezs.once = (mixed, options) => new Once(ezs, mixed, options);
ezs.script = (commands, options) => new Pipeline(ezs, Script(commands), options);
ezs.tag = (tagname, func) => new Tag(tagname, func);
ezs.has = (tagname, name, opts) => new Engine(ezs, Statement.get(ezs, name), opts, tagname);
ezs.toBuffer = opts => new Output(opts);
ezs.use = plugin => Statement.set(ezs, plugin);

ezs.use(Plugins);

module.exports = ezs;

