# Make pipeline of streams easy : Easy Streams

[![Build Status](https://travis-ci.org/touv/node-ezs.png?branch=master)](https://travis-ci.org/touv/node-ezs)

It's just a wrapper to build Stream transformers with functional style. It's like the koa / expressjs middlewares !


# Example

```javascript

const ezs = require('ezs')

ezs.use(require('ezs-basics'));

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin
  .pipe(ezs('split', { delimiter: "\n" }))
  .pipe(ezs('counter'))
  .pipe(ezs(function(input, output) {
	  output.send(input.toString();
  })
  .pipe(process.stdout);


```

# Installation

With [npm](http://npmjs.org):

    $ npm install ezs

# Tests

Use [mocha](https://github.com/visionmedia/mocha) to run the tests.

    $ npm install mocha
    $ mocha test

# API Documentation

## ezs(statement : Mixed, [option : Object]) : Stream

Converts a transform stream with existing function or adhic function.
```javascript
	const ezs = require('ezs'),
	let trasnformer = ezs(function(input, output) {
		output.send(input.toString())
	})

```

### use(module: Function) : None

Adding bundle of statements. see the avaible modules here : https://www.npmjs.com/browse/keyword/ezs


```javascript
	var ezs = require('ezs'),

	ezs.use(require('ezs-basics'));
	ezs.use(require('ezs-files'));

```


# Related projects

* https://github.com/rvagg/through2
* https://github.com/dominictarr/event-stream
* https://github.com/ZJONSSON/streamz
* https://github.com/ZJONSSON/etl


# License

[MIT/X11](https://github.com/touv/node-ezs/blob/master/LICENSE)

