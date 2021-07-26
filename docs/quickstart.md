# Démarrer

## Installation

@ezs se présente sous forme de plusieurs paquets [npm](http://npmjs.org/), dont
un paquet obligatoire: `@ezs/core`

```bash
npm install @ezs/core
```

Les autres paquets viennent en complément pour ajouter des [instructions](statement.md) complémentaires.

```bash
npm install @ezs/basics
npm install @ezs/analytics
```

## Exécuter une instruction existante

Chaque paquet @ezs propose des instructions qui peuvent être associées pour
transformer des données au fil de l'eau.

Voici un simple programme NodeJS qui compte le nombre de lignes d’un fichier
texte :

```js
import ezs from '@ezs/core':
import basics from '@ezs/basics':

ezs.use(basics);

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin
  .pipe(ezs('TXTParse'))
  .pipe(ezs('OBJCount'))
  .pipe(process.stdout);
```

## Exécuter une instruction locale

Le principal intérêt d’`@ezs` est de regrouper des instructions dans des paquets
npm, néanmoins il est possible de créer et utiliser des fonctions Javascript
locales.

Le programme suivant affiche chaque `chunk` dans la console.

```js
import ezs from '@ezs/core':

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin
  .pipe(ezs((input, output) => {
    console.log(input.toString());
    output.end();
   }))
  ;
```

> Si l'usage des **arrow functions** est possible, il n'est pas recommandé.
>
> `@ezs` utilise le scope de chaque fonction pour proposer plusieurs _helpers_
> qui permettent de traiter finement les différents moments d'une exécution au
> fil de l'eau (premier appel, dernier appel, etc.). Voir le [fonctionnement
> d’une instruction](coding-statement.md)
