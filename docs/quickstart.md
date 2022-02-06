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

Voici un simple programme NodeJS qui retourne les 2 premières lignes d’un fichier texte :

```js
import ezs from '@ezs/core';
import ezsBasics from '@ezs/basics';
import ezsAnalytics from '@ezs/analytics';

ezs.use(ezsAnalytics);                 // register all statements from one package

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin
  .pipe(ezs(ezsBasics.TXTParse))        // use only one statement from 
  .pipe(ezs('slice', { size: 2 }))      // from ezsAnalytics package
  .pipe(ezs('dump'))                    // from core package
  .pipe(process.stdout);

```

## Exécuter une instruction locale

Le principal intérêt d’`@ezs` est de regrouper des instructions dans des paquets
npm, néanmoins il est possible de créer et utiliser des fonctions Javascript
locales.

Le programme suivant affiche chaque `chunk` dans la console.

```js
import ezs from '@ezs/core':

process.stdin.setEncoding('utf8');
process.stdin
  .pipe(ezs((data, feed, ctx) => {
        if (ctx.isLast()) {
            return feed.close();
        }
        console.log(input.toString());
        feed.end();
   }));
process.stdin.resume();
```

Dans l'exemple ci-avant :

  -  `data` contient une valeur en transit dans le pipeline. Cette valeur dépend de ce qui circule dans le flux de données (un buffer, un objet, une chaîne de caractère, un nombre, une date, etc.).
  -  `feed` est un objet qui propose plusieurs _helpers_ pour contrôler le flux de données (envoyer au suivant, arrêter, gérer une erreur, brancher un sous pipeline)
  - `ctx` est un *scope* qui propose plusieurs _helpers_ permettant d’identifier les différents moments d'une exécution au  fil de l'eau (premier appel, dernier appel, etc.).

Pour aller plus loin, voir le [fonctionnement d’une instruction](coding-statement.md)

