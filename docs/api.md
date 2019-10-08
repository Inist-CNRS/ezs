# API Documentation

### ezs(statement : Mixed, [params : Object]) : Stream

Converts a transform stream with existing function or adhoc function.

```js
    const ezs = require('@ezs/core'),
    let transformer = ezs(function(input, output) {
        output.send(input.toString())
    })
```

### ezs.use(module: Function) : None

Adding bundle of statements. see the avaible modules here : https://www.npmjs.com/browse/keyword/ezs

```js
    import ezs from '@ezs/core';
    import basics from '@ezs/basics';
    import files from '@ezs/files';

    ezs.use(basics);
    ezs.use(files);
```

### ezs.catch(func : Function)

catch Error in NodeJS pipeline

```js
    // Example #1
    process.stdin
        .pipe(ezs('truncate', { length: 100 }))
        .pipe(ezs((d, f) => f.send(new Error('Badaboum')))))
        .pipe(ezs.catch(e => e)) // catch errors in chunks and throw a error, which breaking the pipeline
        .on('error', console.error)

    // Example #2
    process.stdin
        .pipe(ezs('truncate', { length: 100 }))
        .pipe(ezs((d, f) => f.send(new Error('Badaboum')))))
        .pipe(ezs.catch(e => console.error('Warning:', e))) // catch errors in chunks to display them without breaking the pipeline
```

### ezs.toBuffer(options : Object)

get chunk of in NodeJS pipeline and send Buffer of the chunk

```js
    process.stdin
        .pipe(ezs('replace', { path: 'id', value: 'xxxxx' }))
        .pipe(ezs('dump'))
        .pipe(ezs.toBuffer())
        .pipe(process.stdout);
```

