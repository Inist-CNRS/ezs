# Démarrer


## Installation

@ezs se présente sous forme de plusieurs paquets [npm](http://npmjs.org/), dont un paquet obligatoire `@ezs/core`

```shell
npm install @ezs/core
```



Les autres paquets viennent en complément pour ajouter des [instructions](statement.md) complémentaires.

```shell
npm install @ezs/basics
npm install @ezs/analytics
```



## Exécuter une instruction existante

Chaque paquet @ezs proposent des instructions qui vont pouvoir être associées pour transformer des données au fil de l'eau. 

Voici un simple programme NodeJS qui va compter le nombre de ligne d’un fichier texte : 

```
import ezs from '@ezs/core':
import basics from '@ezs/basics':

ezs.use(bascis);

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin
  .pipe(ezs('split', { delimiter: "\n" }))
  .pipe(ezs('counter'))
  .pipe(process.stdout);
```



## Exécuter une instruction locale

Le principaleintérêt d’ @ezs est de regrouper des instructions dans des paquets npm, néanmoins il est possible de créer et utiliser des fonctions javascript locale

Le programme suivant affichera chaque `chunk` dans la console.
```
import ezs from '@ezs/core':

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin
  .pipe(ezs((input, output) => {
  	console.log(input.toString());
  	output.end();
   })
  ;
```

> Si l'usage des `arrows functions` est possible, il n'est pas recommandé. 
> @ezs utilise le scope de chaque fonction pour proposer plusieurs helpers qui 
> permettent de traiter finnement les différents moment d'une exécutino au fil de l'eau (premier appel, dernier appel, etc.)