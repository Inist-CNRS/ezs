# conditor

## Présentation

Ce plugin est propose une série d'instructions pour traiter (aligner les
affiliations avec le [RNSR](https://appliweb.dgri.education.fr/rnsr/)), requêter
les documents de l'API
[Conditor](https://wiki.conditor.fr/conditor/index.php/Conditor_en_bref).

## installation

```bash
npm install @ezs/core
npm install @ezs/conditor
```

## Scripts

```bash
$ ./bin/affAlign.js < data/1000-notices-conditor-hal.json | ./bin/compareRnsr.js
recall: 0.7104885057471264
correct: 989
total: 1392
```

> **Warning**: to use the scripts, you need to install `@ezs/basics` too.

## Règles certaines

Les règles certaines utilisées par [affAlign](#affAlign), appliquées à l'adresse
de l'affiliation à aligner sont les suivantes:

*   le `code_postal` **ou** la `ville_postale` de la structure doivent être présents,
*   **et**  pour au moins une des tutelles (`etabAssoc.*.etab`, et `etabAssoc.*.etab.natTutEtab` vaut `TUTE`):
    *   soit `etabAssoc.*.etab.sigle` ou le `etabAssoc.*.etab.libelle` sont présents,
    *   soit `etabAssoc.*.etab.libelle` commence par `Université` et le
        `etabAssoc.*.etab.libelle` est présent (mais pas le
        `etabAssoc.*.etab.sigle`).
*   **et** on trouve la bonne structure:
    *   soit `etabAssoc.*.label` et `etabAssoc.*.numero` sont présents proches et en
        séquence (ex: `GDR2945`, `GDR 2945` ou `GDR mot 2945`),
    *   soit `sigle` est présent,
    *   soit `intitule` est présent.
*   **et** la structure existait lors de la publication: une des
    `xPublicationDate` est entre `annee_creation` et l'éventuelle `an_fermeture`.

Sachant qu'on appauvrit (casse, accents, tiret, apostrophe) tous les champs.

## usage

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [affAlign](#affalign)
*   [compareRnsr](#comparernsr)
*   [conditorScroll](#conditorscroll)
*   [CORHALFetch](#corhalfetch)
*   [getRnsr](#getrnsr)
*   [getRnsrInfo](#getrnsrinfo)
*   [OAFetch](#oafetch)
*   [WOSFetch](#wosfetch)

### affAlign

Find the RNSR identifiers in the authors affiliation addresses.

Input file:

```json
[{
     "xPublicationDate": ["2012-01-01", "2012-01-01"],
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

Output:

```json
[{
     "xPublicationDate": ["2012-01-01", "2012-01-01"],
     "authors": [{
         "affiliations": [{
             "address": "GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009",
             "conditorRnsr": ["200619958X"]
         }]
     }]
}]
```

#### Parameters

*   `year` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Year of the RNSR to use instead of the last one (optional, default `2023`)

### compareRnsr

Take Conditor JSON documents and compute the recall of
`authors.affiliations.conditorRnsr` in relation to
`authors.affiliations.rnsr`.

#### Examples

Input

```javascript
[{
     "authors": [{
         "affiliations": [{
             "address": "GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009",
             "rnsr": ["200619958X"],
             "conditorRnsr": ["200619958X"]
         }]
     }]
}]
```

Output

```javascript
{
     "correct": 1,
     "total": 1,
     "recall": 1
}
```

### conditorScroll

Use scroll to return all results from Conditor API.

> :warning: you have to put a valid token into a `.env` file, under
> `CONDITOR_TOKEN` variable:

    CONDITOR_TOKEN=eyJhbG...

#### Parameters

*   `q` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** query (optional, default `""`)
*   `scroll` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** duration of the scroll (optional, default `"5m"`)
*   `page_size` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** size of the pages (optional, default `1000`)
*   `max_page` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** maximum number of pages (optional, default `1000000`)
*   `includes` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** fields to get in the response
*   `excludes` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** fields to exclude from the response
*   `sid` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** User-agent identifier (optional, default `"ezs-conditor"`)
*   `progress` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** display a progress bar in stderr (optional, default `false`)

#### Examples

Input

```javascript
{
  "q": "Test",
  "page_size": 1,
  "max_page": 1,
  "includes": "sourceUid"
}
```

Output

```javascript
[[
    {
        "sourceUid": "hal$hal-01412764",
        "_score": 5.634469,
        "_sort": [
            0
        ]
    }
]]
```

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)>**&#x20;

### CORHALFetch

Take `String` as URL, throw each chunk from the result

Input:

```json
[
  { q: "toto" },
]
```

Script:

```ini
[CORHALFetch]
url = https://corhal-api.inist.fr
```

Output:

```json
[{...}, {"a": "b"}, {"a": "c" }]
```

#### Parameters

*   `url` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** corhal api url
*   `timeout` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Timeout in milliseconds (optional, default `1000`)
*   `retries` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The maximum amount of times to retry the connection (optional, default `5`)

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;

### getRnsr

Find the RNSR identifier(s) matching the `address` and the publication `year`
of an article.

Get objects with an `id` field and a `value` field.

The `value` field is an object containing `address` and `year`.

Returns an object with `id` and `value` fields. The `value` is an array of
RNSR identifiers (if any).

Input:

```json
[{
  "id": 1,
  "value": {
    "address": "GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009",
    "year": "2012"
  }
}]
```

Output:

```json
[{ "id": 1, "value": ["200619958X"] }]
```

#### Parameters

*   `year` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Year of the RNSR to use instead of the last one (optional, default `2023`)

### getRnsrInfo

Find the RNSR information matching the `address` and the publication `year`
of an article.

Get objects with an `id` field and a `value` field.

The `value` field is an object containing `address` and `year`.

Returns an object with `id` and `value` fields. The `value` is an array of
RNSR information objects (if any).

Input:

```json
[{
  "id": 1,
  "value": {
    "address": "Laboratoire des Sciences du Climat et de l'Environnement (LSCE), IPSL, CEA/CNRS/UVSQ Gif sur Yvette France",
    "year": "2019"
  }
}]
```

Output:

```json
[{
    "an_fermeture": "",
    "annee_creation": "2014",
    "code_postal": "75015",
    "etabAssoc": [{
        "etab": {
            "libelle": "Centre national de la recherche scientifique",
            "libelleAppauvri": "centre national de la recherche scientifique",
            "sigle": "CNRS",
            "sigleAppauvri": "cnrs"
        },
        "label": "UMR",
        "labelAppauvri": "umr",
        "numero": "8253"
    }, {
        "etab": {
            "libelle": "Institut national de la sante et de la recherche medicale",
            "libelleAppauvri": "institut national de la sante et de la recherche medicale",
            "sigle": "INSERM",
            "sigleAppauvri": "inserm"
        },
        "label": "U",
        "labelAppauvri": "u",
        "numero": "1151"
    }, {
        "etab": {
            "libelle": "Université Paris Cité",
            "libelleAppauvri": "universite paris cite",
            "sigle": "U PARIS Cité",
            "sigleAppauvri": "u paris cite"
        },
        "label": "UM",
        "labelAppauvri": "um",
        "numero": "111"
    }],
    "intitule": "Institut Necker Enfants Malades - Centre de médecine moléculaire",
    "intituleAppauvri": "institut necker enfants malades   centre de medecine moleculaire",
    "num_nat_struct": "201420755D",
    "sigle": "INEM",
    "sigleAppauvri": "inem",
    "ville_postale": "PARIS",
    "ville_postale_appauvrie": "paris"
}]
```

#### Parameters

*   `year` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Year of the RNSR to use instead of the last one (optional, default `2023`)

### OAFetch

Take `Object` with OpenAlx API parametrs, throw each chunk from the result

Input:

```json
[
  { filter: "authorships.author.id:a5000387389" },
]
```

Script:

````ini
[OAFetch]

Output:

```json
[{...}, {"a": "b"}, {"a": "c" }]
````

#### Parameters

*   `timeout` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Timeout in milliseconds (optional, default `1000`)
*   `retries` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The maximum amount of times to retry the connection (optional, default `5`)

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;

### WOSFetch

Take `String` as URL, throw each chunk from the result

Input:

```json
[
  { q: "toto" },
]
```

Script:

```ini
[WOSFetch]
token = SDQedaeaazedsqsd
```

Output:

```json
[{...}, {"a": "b"}, {"a": "c" }]
```

#### Parameters

*   `url` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** corhal api url (optional, default `https://wos-api.clarivate.com/api/wos`)
*   `token` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** WOS API TOKEN
*   `timeout` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Timeout in milliseconds (optional, default `1000`)
*   `retries` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The maximum amount of times to retry the connection (optional, default `5`)

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
