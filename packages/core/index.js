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
  constructor(func, params, tagname) {
    super( { objectMode: true })
    let self = this;
    self.func = func;
    self.index = 0;
    self.tagname = tagname;
    self.params = params || {};
    self.scope = {};
  }

  _transform(chunk, encoding, done) {
    this.index++;
    if (this.tagname && chunk.tagName && this.tagname === chunk.tagName()) {
      this.execWith(chunk, done);
    }
    else if (this.tagname && chunk.tagName && this.tagname !== chunk.tagName()) {
      this.push(chunk);
      done();
    }
    else if (this.tagname && !chunk.tagName) {
      this.push(chunk);
      done();
    }
    else {
      this.execWith(chunk, done);
    }
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
      if (self.tagname && chunk && chunk.tagName) {
        data.tagName = chunk.tagName;
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
      console.error(self.createError(e));
      self.push(self.createError(e));
    }
  }

  createError(e) {
    let self = this;
    let err = new Error('At index #' + self.index + ' > '  + e.stack);
//    err.index = self.index;
//    err.scope = self.scope;
    // e.chunk = chunk; mmmm it's bad idea...
    /*e.toString = function() {
      return e.errmsg;
    }*/
    return err;
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

ezs.tag = function(tagname, func) {
  assert.equal(typeof tagname, 'string');
  assert.equal(typeof func, 'function');
  return new Transform({
    objectMode: true,

    transform(chunk, encoding, callback) {
      if (func(chunk)) {
        chunk.tagName = function() { return tagname; }
      }
      callback(null, chunk);
    }
  });
  return ezs;
};

ezs.has = function(tagname, name, opts) {
    if (isStatement(name)) {
    return new Engine(name, opts, tagname);
  }
  else if (typeof name === 'string' && ezs.plugins[name]) {
    return new Engine(ezs.plugins[name], opts, tagname);
  }
  else {
    throw new Error('`' + name +'` unknown');
  }
};




module.exports = ezs;

