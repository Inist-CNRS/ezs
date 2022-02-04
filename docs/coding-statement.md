# Fonctionnement d’une instruction

## Présentation

La fonction est exécutée pour chaque élément du flux d'entrée, plus une dernière
fois pour indiquer qu'il n'y a plus d’élément à traiter. À chaque fois, elle
reçoit deux paramètres : `data` & `feed`.

> Si un flux contient 10 éléments, la fonction sera exécutée 11 fois.

Chaque fonction possède un `scope` lui donnant accès à des fonctions dédiées.
Le `scope` est partagé entre chaque appel pour chaque élément.

## data

Contient la valeur de l'élément courant du flux, pour un flux texte ou binaire,
`data` contiendra un `chunk`. Pour un flux d’objets `data` contiendra un objet
JavaScript.

## feed

Est un objet permettant de contrôler le flux en sortie de la fonction. Il permet
de générer zéro, un ou N élément(s) en sortie. L'objet `feed` propose les
fonctions suivantes :

### feed.write(something)

Permet d'envoyer un élément dans le flux de sortie.
Cette fonction peut être exécutée plusieurs fois.

### feed.flow(stream, [callback])

Permet d'envoyer le contenu d'un *stream* à l'élément suivant.

Chaque *chunk* est envoyé séparément. Quand le stream s'arrête ("end"),
l'élément courant est fermé, sauf si une fonction de *callback* est passée en
argument. Dans ce cas, il faudra fermer l'élement courant explicitement via un
appel à `feed.end()`.

Cette fonction peut être exécutée plusieurs fois.

### feed.end()

Permet de fermer le flux pour l’élément courant.

### feed.send(something)

Permet d’enchaîner `feed.write` et `feed.end` en une seule fonction.

### feed.close()

Permet de fermer définitivement le flux de sortie, plus aucun élément ne pourra
être envoyé.

### feed.stop(withAnError)

Permet de fermer le flux de sortie en précisant l'erreur ayant provoqué l’arrêt
impromptu, plus aucun élément ne pourra être envoyé.

## Scope

### Environnement partagé

Le *scope* de chaque fonction est le même entre chaque appel à la fonction pour
chaque élément du flux.
C’est un moyen simple pour partager des données entre 2 appels de fonctions.

Exemple :

```js
// Dans une fonction classique, c'est le scope de fonction elle-même
function count(data, feed) {
    if (!this.count) {
        this.count = 0;
    }
    if (this.isLast()) {
        feed.write(this.count);
        return feed.close();
    }
    this.count += 1;
    return feed.end();
}

// avec une fonction fléchée, c'est le troisème argument
const count = (data, feed, ctx) => {
    if (!ctx.count) {
        ctx.count = 0;
    }
    if (ctx.isLast()) {
        feed.write(this.count);
        return feed.close();
    }
    ctx.count += 1;
    return feed.end();
};
```

### ctx.getParam(name, defaultValue)

Il est très souvent nécessaire de paramétrer une instruction. Les paramètres
sont identiques pour chaque élément du flux. Cette fonction permet d’accéder à
un paramètre par son nom.

> **Attention**: la valeur d’un paramètre ne peut pas être un `Object`.

### ctx.isLast()

Cette fonction permet de savoir si l’appel courant à la fonction est le
**dernier** appel.

Dans ce cas, `data` vaut `null`.

### ctx.isFirst()

Cette fonction permet de savoir si l’appel courant à la fonction est le
**premier** appel.

### ctx.getIndex()

Cette fonction permet de connaître l’index de l’élément courant.
C’est-à-dire son numéro de ligne.

## Erreurs

La gestion des erreurs est primordiale lors d’un traitement de flux. Il existe 2
types d’erreurs.

###  Erreur de données

Ce type d’erreur ne bloque pas l’exécution de l’instruction, celle-ci a traité
un élément en erreur qui n’impacte pas le traitement des autres éléments.
L’instruction peut décider d’ignorer l’élément ou de le remplacer par un objet
erreur. Cette dernière possibilité permet de recenser les éléments erreurs tout
en traitant les autres.

Exemple :

```js
// avec une fonction classique
function check(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (data === 'non conforme') {
        return feed.send(new Error('Non conforme'));
    }
    return feed.send(data);
}

// avec une fonction fléchée
const check = (data, feed, ctx) => {
    if (ctx.isLast()) {
        return feed.close();
    }
    if (data === 'non conforme') {
        return feed.send(new Error('Non conforme'));
    }
    return feed.send(data);
};
```

### Erreur de traitement

Ce type d’erreur bloque l’exécution de l’instruction, et implique qu’aucun autre
élément ne pourra être traité.

Pour arrêter le flux, il est possible de lancer une erreur via un `throw`.
Attention, cela ne vaut que pour des instructions synchrones. Dans tous les
autres cas, il est nécessaire d’arrêter le flux avec un `feed.stop`

Exemple :

```js
// avec une fonction classique
function plouf(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return setTimeout(() => {
        feed.stop(new Error(`Plouf #${this.getIndex()}`));
    }, 1);
}

// avec une fonction fléchée
const plouf = (data, feed, ctx) => {
    if (ctx.isLast()) {
        return feed.close();
    }
    return setTimeout(() => {
        feed.stop(new Error(`Plouf #${ctx.getIndex()}`));
    }, 1);
}
```

### Collecte des erreurs

### Les erreurs de données

Une erreur de données est une erreur qui vient remplacer la données attendue en sortie de l'instruction.
Elle **n’arrête pas** le flux de données, il conviendra de récupérer les erreurs une à une.

la fonction `ezs.catch` permet d’extraire les erreurs des données d’un flux. Une
fois extraites des données, il est possible d’arrêter le flux ou de continuer
sans les erreurs.

```js
// Example #1
process.stdin
    .pipe(ezs('truncate', { length: 100 }))
    .pipe(ezs((d, f) => f.send(new Error('Badaboum')))))
    .pipe(ezs.catch(e => e)) // catch errors in chunks and throw an error, breaking the pipeline
    .on('error', console.error)

// Example #2
process.stdin
    .pipe(ezs('truncate', { length: 100 }))
    .pipe(ezs((d, f) => f.send(new Error('Badaboum')))))
    .pipe(ezs.catch(e => console.error('Warning:', e))) // catch errors in chunks to display them without breaking the pipeline
```

### Les erreurs de traitement

Une erreur de traitement est une erreur qui indique que le traitement ne peut plus s'exécuter correctement.
Elle **arrête** le flux de données, il conviendra d’attraper l’évènement erreur à la fin de toutes instructions (ezs fait transiter les erreurs jusqu’à la dernière)

Ce type d’erreur se gère avec le mécanisme standard des erreurs de stream.

```js
 process.stdin
    .pipe(ezs('truncate', { length: 100 }))
    .pipe(ezs((d, f) => f.stop(new Error('Plaffff'))))
    .on('error', console.error)
```

> En cas d’erreur, `ezs` transmet les erreurs d’instruction en instruction
> jusqu’à la fin du _pipeline_. Ce n’est pas cas avec les Class Stream
