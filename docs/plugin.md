# Les plugins

Les plugins sont une série d’instructions généralement regroupées par thématique ou par usage dans un paquet NPM. Les instructions sont documentées dans le fichier README.md du paquet. Le dépôt Github @ezs regroupent plusieurs plugins utilisés production. Leur évolution et leur compatibilité avec @ezs/core est garanti. D’autres plugins sont disponibles par ailleurs, leur développement est indépendant @ezs/core.

## Installation

Pour utiliser un plugin, il faut commencer par installer le paquet npm concerné. Exemple :

```
npm install @es/basics
npm install @ezs/analytics
```



## Déclaration

Une fois le paquet NPM installé, il est nécessaire de charger/déclarer le plugin via la fonction `use`. 

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



