# Les plugins

Les plugins sont une série d’instructions généralement regroupées par thématique ou par usage dans un paquet NPM. Les instruction sont documentées dans le README du paquet. Le dépôt Github @ezs regroupent plusieurs plugins utilisés production. Leur évolution et leur compatibilité avec @ezs/core est garanti. D’autres plugins sont disponibles par ailleurs, leur développement est indépendant @ezs/core.

## Installation

Pour utiliser un plugin, il faut commencer par installer le paquet npm concerné. Exemple :

```
npm install @es/basics
npm install @ezs/analytics
```



## Déclaration

Une fois le paquet NPM installé, il est nécessaire de charger/déclarer le plugin via la function `use`. 

###  nodejs

```

import ezs from '@ezs/core':
import basics from '@ezs/basics':
import analytics from '@ezs/analytics':

ezs.use(bascis);
ezs.use(analytics);

```

### .ini

```

[use]
plugin = basics
plugin = analytics

```

## Instructions disponibles

### instructions natives

Le paquet @ezs/core propose plusieurs instructions natives principalement utilisés par le paquet lui-même :

-  assign
-  concat
-  debug
-  delegate
-  dispatch
-  dump
-  env
-  extract
-  group
-  keep
-  pack
-  replace
-  shift
-  shuffle
-  tracer
-  transit
-  truncate
-  ungroup
-  unpack

Pour plus d'information, voir la documentation de chaque instruction : https://github.com/Inist-CNRS/ezs/tree/master/packages/core#statements


### instructions de bases

Le paquet @ezs/basics propose plusieurs instructions permettant de transformer plusieurs formats text en flux d'objets javascript: 

- BUFObject
- CSVObject
- CSVParse
- CSVString
- JSONParse
- JSONString
- OBJCount
- OBJFlatten
- OBJStandardize
- SKOSObject
- TXTConcat
- TXTObject
- TXTParse
- TXTZip
- URLFetch
- URLParse
- URLStream
- URLString
- XMLParse
- XMLString

Pour plus d'information, voir la documentation de chaque instruction : https://github.com/Inist-CNRS/ezs/tree/master/packages/basics#statements

### instructions avancées ou spécifiques

D’autres paquets du dépôt Github @ezs sont disponibles : 

-  [@ezs/analytics](https://github.com/Inist-CNRS/ezs/blob/master/packages/analytics#readme)
-  [@ezs/sparql](https://github.com/Inist-CNRS/ezs/blob/master/packages/sparql#readme)
-  [@ezs/istex](https://github.com/Inist-CNRS/ezs/blob/master/packages/istex#readme)
-  [@ezs/booster](https://github.com/Inist-CNRS/ezs/blob/master/packages/booster#readme)
-  [@ezs/lodex](https://github.com/Inist-CNRS/ezs/blob/master/packages/lodex#readme)
