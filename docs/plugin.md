# Les plugins

## Présentation

Les _plugins_ sont une série d’instructions généralement regroupées par
thématique ou par usage dans un paquet NPM.
Les instructions sont documentées dans le fichier `README.md` du paquet.

Le dépôt Github [@ezs](https://github.com/Inist-CNRS/ezs) regroupe plusieurs
_plugins_ utilisés en production. Leur évolution et leur compatibilité avec
`@ezs/core` sont garanties.

D’autres plugins sont disponibles par ailleurs, leur développement est
indépendant de l'organisation npm [`@ezs`](https://www.npmjs.com/org/ezs).

## Installation

Pour utiliser un plugin, il faut commencer par installer le paquet npm concerné.
Exemple :

```bash
npm install @es/basics
npm install @ezs/analytics
```

## Déclaration

Une fois le paquet NPM installé, il est nécessaire de charger/déclarer le plugin
via la fonction `use`.

### nodejs

```js
import ezs from '@ezs/core':
import basics from '@ezs/basics':
import analytics from '@ezs/analytics':

ezs.use(basics);
ezs.use(analytics);
```

### .ini

```ini
[use]
plugin = basics
plugin = analytics
```
