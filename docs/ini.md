# Fichier .ini

## Présentation


ezs propose un [DSL](https://fr.wikipedia.org/wiki/Langage_d%C3%A9di%C3%A9) permettant de décrire une chaîne de  traitements d’un flux de données dans un fichier texte. L’objectif est de pouvoir modifier, enrichir, corriger  une chaîne de traitements sans toucher au code du programme, de l’application en charge de son exécution. Il devient ainsi possible d’adapter simplement les traitements aux données, ceci sans compétence Javascript.

## Syntaxe

Une chaîne de traitements correspond à un fichier, ce fichier respecte la syntaxe [.ini](https://fr.wikipedia.org/wiki/Fichier_INI) avec le paralle suivant :

- Chaque section ` [SECTION] ` correspond à un traitment EZS
- Chaque paramètre `name = value ` correspond aux paramètres du traitement

L'ordonnancement des sections correspond à l’ordonnancement des traitements.

### Note

*Les paramètres en entêtes du fichier (non rattaché à une section) ne sont pas utilisés directement par ezs, mais ils peuvent servir de métadonnées à destination de l’application ou le programme en charge de son exécution*

## Exemple

Voici un fichier .ini est son équivalent en .js

### .ini

```ini
; Take JSON to generate CSV
[use]
plugin = basics

; Step #1 : Parse JSON input (from elasticsearch result )
[JSONParse]
separator = hits.*

; Step #2 : Simplify each object 
[OBJFlatten]

; Step #3 : make uniform each object
[OBJStandardize]

; Step #4 : genreate csv
[CSVString]
format = strict

```


### .js

```js
// Take JSON to generate CSV

import basics from 'ezs-bascis';
ezz.use(basics);

// Step #1 : Parse JSON input (from elasticsearch result )
const s1 = input.pipe(ezs('JSONParse', { 
	'separator' : 'hits.*'
}));

// Step #2 : Simplify each object 
const s2 = s1.pipe(ezs('OBJFlatten'));

// Step #3 : make uniform each object
const s3 = s2.pipe(ezs('OBJStandardize'));

// Step #4 : genreate csv
const s4 = s3.pipe(ezs('CSVString', { 
	'format': 'strict'
}));

```








