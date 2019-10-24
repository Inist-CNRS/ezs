# ezs-conditor

Instructions EZS pour Conditor.

## Instructions

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
    > test/fixture-10-notices-conditor-hal.json
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
