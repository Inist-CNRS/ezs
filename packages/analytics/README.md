# A collection of `ezs` analytics functions.

This package cannot be used alone. [ezs](https://www.npmjs.com/package/ezs) has to be installed

## Usage

```js
import ezs from 'ezs';
import analytics from 'ezs-analytics';

ezs.use(analytics);

process.stdin
    .pipe(ezs('STATEMENT_NAME', { STATEMENT_PARAMETERS })
    .pipe(process.stdout);
```

# Statements

