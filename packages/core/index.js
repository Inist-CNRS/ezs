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
  close() {
    this.write(null);
    this.end();
  }
}

class Engine extends Transform {
  constructor(func, params) {
    super( { objectMode: true })
    let self = this;
    self.func = func;
    self.index = 0;
    self.params = params || {};
    self.scope = {};
  }

  _transform(chunk, encoding, done) {
    this.index++;
    this.execWith(chunk, done);
  }

  _flush(done) {
    this.execWith(null, done);
  }

  execWith(chunk, done) {
    let self = this;
    let push = function(data) {
      if (data instanceof Error) {
        data = self.createError(data);
      }
      self.push(data);
    }
    let feed = new Feed(push, done);
    self.scope.isFirst = function() { return (self.index === 1); };
    self.scope.getIndex = function() { return self.index; };
    self.scope.isLast = function() { return (chunk === null); };
    self.scope.getParams = function() { return self.params; };
    self.scope.getParam = function(name, defval) { return self.params[name] ? self.params[name] : defval; };
    try {
      self.func.call(self.scope, chunk, feed)
    }
    catch(e) {
      self.push(self.createError(e));
    }
  }

  createError(e) {
    let self = this;
    e.index = self.index;
    e.scope = self.scope;
    // e.chunk = chunk; mmmm it's bad idea...
    e.toString = function() {
      return '\nAt index #' + self.index + '\n'  + e.stack;
    }
    return e;
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
    else {
      throw new Error('`' + moduleName + '` is not loaded. It\'s not a valid statement.')
    }
  });
  return ezs;
};


module.exports = ezs;

