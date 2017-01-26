'use strcit';

const assert = require('assert');
const Transform = require('stream').Transform;

class Feed {
  constructor(push, done) {
    this.push = push;
    this.done = done;
  }
  write(something) {
    if (something !== undefined) {
      this.push(something);
    }
  }
  end() {
    this.done();
  }
  send(something) {
    this.write(something);
    this.end();
  }
}

class Engine extends Transform {
  constructor(func, opts) {
    super( { objectMode: true })
    let self = this;
    self.func = func;
    self.scope = {
      index : 0,
      options : opts
    };
  }

  _transform(chunk, encoding, done) {
    this.scope.index++;
    this.execWith(chunk, done);
  }

  _flush(done) {
    this.execWith(null, done);
  }

  execWith(chunk, done) {
    let self = this;
    let push = function(data) {
      self.push(data);
    }
    let feed = new Feed(push, done);
    self.func.call(self.scope, chunk, feed)

  }

}


function isStatement(name) {
  return typeof name === 'function';
}

function ezs(name, opts) {

  if (isStatement(name)) {
    return new Engine(name, opts);
  }
  else if (typeof name === 'string' && ezs.plugins[name]) {
    return new Engine(ezs.plugins[name], opts);
  }
  else {
    throw new Error('`' + name +'` unknown');
  }
}
ezs.plugins = {};
ezs.use = function(module) {
  let self = this;
  assert.equal(typeof module, 'object');
  Object.keys(module).forEach(moduleName => {
    if (isStatement(module[moduleName])) {
      ezs.plugins[moduleName] = module[moduleName];
    }
  });
  return this;
};


module.exports = ezs;

