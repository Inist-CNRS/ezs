#  Fonctionnement d’une instruction

La fonction est exécutée pour chaque élément du flux d'entrée, plus une dernière fois pour indiquer qu'il n'y  a plus d’élément à traiter. A chaque fois elle reçoit deux paramètres `data` & `feed`.

>  Si un flux contient 10 éléments, la fonction sera exécutée 11 fois



Chaque fonction possède son `scope ` lui donnant accès à des fonctions dédiés. Le `scope` est partagé entre chaque appel pour chaque élément.

## data

Contient la valeur de l'élément courant du flux, pour un flux texte ou binaire, `data` contiendra un `chunk`. Pour un flux d’objets `data` contiendra un objet JavaScript.

## feed

Est un objet permettant de contrôler le flux en sortie de la fonction. Il permet de générer zéro, un ou N élément en sortie. L'objet Feed propose  les fonctions suivantes :

### feed.write(something) 

Permet d'envoyer un élément dans le flux de sortie. Cette fonction  peut-être exécuté plusieurs fois

### feed.end()

Permet de fermer le flux pour l’élément courant. 

### feed.send(something)

Permet d'enchainer `feed.write` et `feed.end` en une seule fonction.

### feed.close()

Permet de fermer définitivement le flux de sortie, plus aucun élement ne pourra être envoyé.

### feed.stop(withAnError)

Permet de fermer le flux de sortie en précisant l'erreur ayant provoqué l’arrêt impromptu, plus aucun élément ne pourra être envoyé.

## Scope

### this.getParam(name, defaultValue)

Il est très souvent nécessaire de paramétrer une instruction. Les paramètres sont identiques pour chaque élément du flux. Cette fonction permet d’accéder à un paramètre par son nom.

>  Attention, la valeur d’un paramètre ne peut pas être un `Object`

### this.isLast()

Cette fonction permet de savoir si l’appel courant à la fonction est le **dernier** appel. 

### this.isFirst()

Cette fonction permet de savoir si l’appel courant à la fonction est le **premier** appel. 

### this.getIndex()

Cette fonction permet de connaître l’index de l’élément courant. C’est à dire son numéro de ligne.

## Erreurs

La gestion des erreurs est primordiale lors d’un traitement de flux. Il existe 2 types d’erreurs. 

### Erreur de données

Ce type d’erreur ne bloque pas l’exécution de l’instruction, celle-ci a traité un élément en erreur. L’instruction peut décider d’ignorer l’élément ou le remplacer par un objet erreur. Cette dernière possibilité offre la possibilité de recenser les éléments erreurs tout en traitant tout les autres.

Exemple :

```
function check(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (data === 'non conforme') { 
    	return feed.send(new Error('Non conforme'));
    } 
    return feed.send(data);
}
```

### Erreur de traitement

Ce type d’erreur bloque l’exécution de l’instruction, et implique qu’aucun autre élément ne pourra être traité. 

Pour arrêter le flux, il est possible de lancer une erreur via un `throw`.  Attention, cela ne vaut que pour des instructions synchrones. Dans tout les autre cas, il est nécessaire d’arrêter le flux avec un `feed.stop` 

Exemple :

```
function plouf(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return setTimeout(() => {
        feed.stop(new Error(`Plouf #${this.getIndex()}`));
    }, 1);
}
```



### Collecte des erreurs

### Les erreurs de données

la fonction `ezs.catch` permet d’extraire les erreurs des données d’un flux. Une fois extraite les données, il possible d’arrêter le le flux ou de continuer sans les erreurs.

```
 // Example #1
    process.stdin
        .pipe(ezs('truncate', { length: 100 }))
        .pipe(ezs((d, f) => f.send(new Error('Badaboum')))))
        .pipe(ezs.catch(e => e)) // catch errors in chunks and throw a error, which breaking the pipeline
        .on('error', console.error)

    // Example #2
    process.stdin
        .pipe(ezs('truncate', { length: 100 }))
        .pipe(ezs((d, f) => f.send(new Error('Badaboum')))))
        .pipe(ezs.catch(e => console.error('Warning:', e))) // catch errors in chunks to display them without breaking the pipeline
```

### Les erreurs de traitement

Ce type d’erreur se gère avec le mécanisme standard des erreurs de stream.

```
 process.stdin
        .pipe(ezs('truncate', { length: 100 }))
        .pipe(ezs((d, f) => f.stop(new Error('Plaffff'))))
        .on('error', console.error)
```

>  en cas d’erreur, ezs transmet les erreurs d’instruction en instruction jusqu’à la fin du pipeline.
>
>  ce qui n’est pas cas avec les Class Stream