# Basics statements for ezs

This package cannot be used alone. EZS has to be installed.

## Usage

```js
var ezs = require('ezs');
ezs.use(require('ezs-basics'));
```


## Statements

### stringify

no argument.

```js
ezs('stringify')
```

### jsonify

no argument.

```js
ezs('jsonify')
```

### TXTParse

*aliases : split, segmenter*

```js
ezs('TXTParse',	{
	separator : "\n"
})
```

### XMLParse

```js
ezs('XMLParse',	{
	separator : "/root/*"
})
```

### CSVParse

argument is the options of CSV parse.

```js
ezs('CSVParse',	{
	separator : ","
})
```

### CSVObject

no argument.
