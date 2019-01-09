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
  .pipe(ezs((input, output) => output.send(input.toString()));
  .pipe(process.stdout);
```

# Installation

With [npm](http://npmjs.org):

    $ npm install ezs

# Tests

Use [mocha](https://github.com/visionmedia/mocha) to run the tests.

    $ npm install mocha
    $ mocha test

# Concepts

### Scope

Each statement function have its own scope and can access to few methods :

-   this.isLast()
-   this.isFirst()
-   this.getIndex()
-   this.getParam(name, defaultValue)

### Output Object

Output object is an object with few methods :

-   output.write(something)
-   output.end()
-   output.send(something)
-   output.close()
-   output.stop(withAnError)

With a sync statement, you can break the pipe  with throw but with an async statement, you should use `stop(with An Error)` instead of throw.

### statement modes

Each statement can be executed in different modes :

-   **normal** : the statement is executed on each object its received
-   **unique** : the statement is executed only on the first object its received, for all other objects, the same result as the first object is return
-   **detachable** : the statement is executed on each object its received, but if ezs use a cluster or a server, the statement is executed on the server/cluster

The basic way to use modes, it's with a ezs script or with ezs.dispatch function.

# API Documentation

## ezs(statement : Mixed, [params : Object]) : Stream

Converts a transform stream with existing function or adhoc function.

```javascript
	const ezs = require('ezs'),
	let transformer = ezs(function(input, output) {
		output.send(input.toString())
	})
```

## ezs.use(module: Function) : None

Adding bundle of statements. see the avaible modules here : <https://www.npmjs.com/browse/keyword/ezs>

```javascript
	import ezs from 'ezs';
	import basics from 'ezs-basics';
	import files from 'ezs-files';

	ezs.use(basics);
	ezs.use(files);
```

## ezs.config = (name : String, options : Object)

To set globaly a statement parameter.

## ezs.pipeline = (commands, options : Object)

Launch a serie of statements.

## ezs.dispatch = (commands, options : Object)

Launch, through a server, a serie of statements.

## ezs.metaString = (commands: String, options : Object)

Parse an .ini string to extract global keys and values.

## ezs.metaFile = (filename : String, options : Object)

Parse an .ini file to extract global keys and values.

## ezs.parseString = (commands : String)

Parse an .ini string and return Object contains a serie of statements

## ezs.fromString = (commands, options : Object)

Parse an .ini string and launch a serie of statements

## ezs.parseFile = (filename : String)

Parse an .ini file and return Object contains a serie of statements

## ezs.fromFile(filename : String, options : Object)

Parse an .ini file and launch a serie of statements

## ezs.catch(func : Function)

catch Error in NodeJS pipeline

## ezs.toBuffer(options : Object)

get chunk of in NodeJS pipeline and send Buffer of the chunk

## ezs.createCache = (options: Object)

To cache the result of the pipeline.
Options:

-   `max` **Number**  max items in the cache (optional, default `500`)
-   `maxAge` Number max age of items in the cache (optional, default `360000`)
-   `objectMode` Boolean cache for object (or Buffer) (optional, default `false`)

Example:

```javascript
    const cache = ezs.createCache({ objectMode: false });

    const cacheID = 'XXXXXX';
    const cached = cache1.get(cacheID);
    if (cached) {
        cached
            .pipe(process.stdout)
    } else {
        process.stdin
            .pipe(cache1.set(cacheID))
            .pipe(process.stdout)
    }
```

## ezs.createStream = (options : Object)

To create a Passthru stream.

Example:

```javascript
    const input = ezs.createStream();
    input.pipe(process.stdout);
    input.write('Hello');
    input.end();
```

## ezs.save = (path : String, options : Object)

Save a Object streams to the filesystem.

Example:

```javascript
    const input = ezs.createStream(ezs.objectMode());
    input.pipe(ezs.save('/tmp/db'));
    input.write({ text: 'Hello' });
    input.write({ text: 'World' });
    input.end();
```

## ezs.load = (path : String, options : Object)

Load a Object streams from the filesystem. (saved by ezs.save function)

Example:

```javascript
    const input = ezs.load('/tmp/db');
        .pipe(process.stdout)
```

## ezs.compress = (options : Object)

Compress a binary stream.

Example:

```javascript
    process.stdin
        .pipe(ezs.compress())
        .pipe(process.stdout)
    ;
```

## ezs.uncompress = (options : Object)

Uncompress a binary stream. (compressed by ezs.compress function)

Example:

```javascript
    process.stdin
        .pipe(ezs.uncompress())
        .pipe(process.stdout)
    ;
```

## ezs.createServer = (port : Number)

Launch a server for ezs.dispatch

## ezs.createCluster = (port : Number)

Launch a cluster for ezs.dispatch

# Statements

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [assign](#assign)
    -   [Parameters](#parameters)
-   [concat](#concat)
    -   [Parameters](#parameters-1)
-   [debug](#debug)
    -   [Parameters](#parameters-2)
-   [dump](#dump)
    -   [Parameters](#parameters-3)
-   [env](#env)
    -   [Parameters](#parameters-4)
-   [extract](#extract)
    -   [Parameters](#parameters-5)
-   [group](#group)
    -   [Parameters](#parameters-6)
-   [keep](#keep)
    -   [Parameters](#parameters-7)
-   [pack](#pack)
    -   [Parameters](#parameters-8)
-   [replace](#replace)
    -   [Parameters](#parameters-9)
-   [shift](#shift)
    -   [Parameters](#parameters-10)
-   [shuffle](#shuffle)
    -   [Parameters](#parameters-11)
-   [transit](#transit)
    -   [Parameters](#parameters-12)
-   [ungroup](#ungroup)
    -   [Parameters](#parameters-13)
-   [unpack](#unpack)
    -   [Parameters](#parameters-14)

## assign

Take `Object` and add new field

### Parameters

-   `data`  
-   `feed`  
-   `path` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** path of the new field
-   `value` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** value of the new field

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## concat

Take all `String`, concat them and thow just one

### Parameters

-   `data`  
-   `feed`  
-   `beginWith` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Add value at the begin
-   `joinWith` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** use value to join 2 chunk
-   `endWith` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Add value at the end

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

## debug

Take `Object` , print it and throw the same object

### Parameters

-   `data`  
-   `feed`  
-   `level` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** console level : log or error (optional, default `log`)
-   `text` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** text before the dump (optional, default `valueOf`)
-   `path` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** path of field to print

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## dump

Take all `Object` and genereta a json array

### Parameters

-   `data`  
-   `feed`  
-   `indent` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** indent JSON (optional, default `false`)

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

## env

Take `Object` and send the same object
but in the meantime, it is possible to add
new environment field

### Parameters

-   `data`  
-   `feed`  
-   `path` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** path of the new field
-   `value` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** value of the new field

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## extract

Take `Object` and throw each value of fields

### Parameters

-   `data`  
-   `feed`  
-   `path` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** path of field to extract

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## group

Take all `chunk`, and throw array of chunks

### Parameters

-   `data`  
-   `feed`  
-   `size` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Size of each partition

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

## keep

Take `Object` and throw the same object but keep only
spefici fields

### Parameters

-   `data`  
-   `feed`  
-   `path` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** path of field to keep

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## pack

Take all `Object`, throw encoded `String`

### Parameters

-   `data`  
-   `feed`  

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

## replace

Take `Object` and create a new object with some fields

### Parameters

-   `data`  
-   `feed`  
-   `path` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** path of the new field
-   `value` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** value of the new field

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## shift

Take the first `Object` and close the feed

### Parameters

-   `data`  
-   `feed`  

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## shuffle

Take `Object`, shuffle data of the whole object or only some fields specified by path

### Parameters

-   `data`  
-   `feed`  
-   `path` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** path of field to shuffle

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## transit

Take `Object` and throw the same object

### Parameters

-   `data`  
-   `feed`  

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## ungroup

Take all `chunk`, and throw each item of chunks

### Parameters

-   `data`  
-   `feed`  

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

## unpack

Take `String` and throw `Object` builded by JSON.parse on each line

### Parameters

-   `data`  
-   `feed`  

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

# Related projects

-   <https://github.com/rvagg/through2>
-   <https://github.com/dominictarr/event-stream>
-   <https://github.com/ZJONSSON/streamz>
-   <https://github.com/ZJONSSON/etl>
-   <https://github.com/chbrown/streaming>

# License

[MIT/X11](https://github.com/touv/node-ezs/blob/master/LICENSE)
