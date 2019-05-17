# node-ezs-sparql
SPARQL module for ezs

This package cannot be used alone. [ezs](https://www.npmjs.com/package/ezs) has to be installed

## Usage

```js
import ezs from 'ezs';
import sparql from 'ezs-sparql';

ezs.use(sparql);

process.stdin
    .pipe(ezs('SPARQLQuery'))
    .pipe(process.stdout);
```

## Statements
