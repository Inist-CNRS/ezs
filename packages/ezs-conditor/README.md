# ezs-conditor

[![npm version](https://img.shields.io/npm/v/ezs-conditor)](https://npm.im/ezs-conditor)
[![Build Status](https://travis-ci.org/conditor-project/ezs-conditor.png?branch=master)](https://travis-ci.org/conditor-project/ezs-conditor)
[![Coverage Status](https://coveralls.io/repos/github/conditor-project/ezs-conditor/badge.svg?branch=master)](https://coveralls.io/github/conditor-project/ezs-conditor?branch=master)

Instructions EZS pour Conditor.

## Installation

```bash
npm install @ezs/core
npm install ezs-conditor
```

## Scripts

```bash
$ ./bin/affAlign.js < data/1000-notices-conditor-hal.json | ./bin/compareRnsr.js
recall: 0.7162356321839081
correct: 997
total: 1392
```

## Instructions EZS

### affAlign

Retrouve la combinaison RNSR dans les adresses des affiliations des auteurs.

### Exemple

Fichier en entrée:

```json
[{
    "authors": [{
        "affiliations": [{
            "address": "GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009"
        }]
    }]
}]
```

Script:

```ini
[use]
plugin = basics
plugin = conditor

[JSONParse]
[affAlign]
[JSONString]
indent = true
```

Sortie:

```json
[{
    "authors": [{
        "affiliations": [{
            "address": "GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009",
            "conditorRnsr": ["200619958X"]
        }]
    }]
}]
```

#### Requêtes pour les notices

```bash
curl 'https://api-integ.conditor.fr/v1/records?q="source:hal%20AND%20authors>affiliations>\"*\""&page_size=10&includes=authors,sourceUid&access_token=...' \
    > data/10-notices-conditor-hal.json
```

#### Règles certaines

Ajouter la référence RNSR retrouvée dans l'affiliation, dans un champ
`conditorRnsr`.

Conditions nécessaires (pour toutes les règles _certaines_):

- le `code_postal` **ou** la `ville_postale` de la structure doivent être
  présents dans `address` (de la notice),
- **et** pour au moins une des tutelles (`etabAssoc.*.etab`, et
  `etabAssoc.*.etab.natTutEtab` vaut `TUTE`):
  - soit le `sigle` ou le `libelle` sont présent dans `address`,
  - soit `libelle` commence par `Université` et le `libelle` est présent dans
    `address` (mais pas le `sigle`).

On trouve la bonne structure (et donc son `num_nat_struct`):

- soit `etabAssoc.*.label` et `etabAssoc.*.numero` sont présent proches (en
  séquence, ex: `GDR2945` `GDR 2945` ou `GDR CNRS 2945`) dans `address`,
- soit `sigle` est présent dans `address`,
- soit `intitule` est présent dans `address`.

À partir de la version 1.1, quand on cherche une chaîne de caractères, on ne
tient plus compte de sa casse.

À partir de la version 1.2, quand on cherche une chaîne de caractères, on ne
tient plus compte des accents.

À partir de la version 1.3, le traitement est plus rapide.
