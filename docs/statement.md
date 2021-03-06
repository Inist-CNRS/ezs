# Instruction

## Présentation

Un instruction est une fonction JavaScript qui permet de traiter chaque élément
d’un flux (stream). @ezs/core se charge de la rendre compatible avec les
`stream` NodeJS.

Les instructions sont des fonctions Javascript, elles doivent être déclarées
avant leur exécution. Par contre, elles doivent impérativement être utilisées
via la fonction ezs pour être compatible avec les `stream` NodeJS.

## Instruction existante

Les [plugins](plugins.md) permettent d’utiliser des instructions existantes,
elles sont directement utilisables une fois le plugin installé et déclaré.

### dans un programme nodejs

```js
import ezs from '@ezs/core':
import basics from '@ezs/basics':

ezs.use(bascis);

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin
    .pipe(ezs('CSVParse', { delimiter: ',' }))
    .pipe(ezs('dump'))
    .pipe(process.stdout);
```

### dans fichier .ini

```ini
[use]
plugin = basics

[CSVParse]
delimiter = ,

[dump]
```

## Instruction adhoc

Il est possible de définir une fonction juste avant son usage.

```js
function print(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const message = this.getParam('Message', 'Print :');
    console.log(message, data);
    return feed.send(data);
}
process.stdin
    .pipe(ezs(print, { message: 'Le contenu est' }))
    .pipe(process.stdout);
```
