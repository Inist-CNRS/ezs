# Enrichissement de données par API

Voici une série d’exemples, pour enrichir ou traiter une information via une API ou un webservice. Pour fonctionner, l’API doit pouvoir traiter un tableau JSON avec des objets contenant au moins un champ  *value* qui servira comme valeur d’entrée et qui contiendra le résultat du traitement en sortie. Idéalement, l’API pourra fonctionner avec ezs lui-même.

Les exemples ci-après proposent différents patrons à réutiliser en fonction de l’emplacement de donnée à traiter dans l’objet source.

Pour chaque exemple, le champ d’origine est dupliqué pour avoir en sortie la valeur originelle et la valeur modifiée par le web service.

## Chemin direct et valeur unique

### Données

```json
{ 
  "address" : {
    "city": "Nancy"
  }
}
```

Le contenu du champ `city` est envoyé au web service quel que soit son contenu. Charge au web service de savoir le traiter.

### Configuration

```ini
[use]
plugin = basics
plugin = analytics

[assign]
path = address.city_enriched
value = get('address.city')

[expand]
path = address.city_enriched
size = 100

[expand/URLConnect]
url = https://webservice.url
timeout = 1000
noerror = true
```

## Chemin direct et valeurs multiples (tableau)

### Données

```json
{
 "address" : {
    "cities": ["Nancy", "Toul", "Paris"]
  }
}
```

Chaque élément du champ `cities` est envoyé au web service quel que soit son contenu. Charge au web service de savoir les traiter.

### Configuration

```ini
[use]
plugin = basics
plugin = analytics

[assign]
path = address.cities_enriched
value = get('address.cities')

[map]
path = address.cities_enriched

[map/expand]
path = value
size = 100

[map/expand/URLConnect]
url = https://webservice.url
timeout = 1000
noerror = true

```

## Sous chemin valeur unique dans valeur multiple

### Données

```json
{ 
  "cities": [
  { 
    "nom": "Nancy",
    "dept": 54
  },
  { 
    "nom": "Paris",
    "dept": 75
  }
  ]
}
```

Le contenu de chaque champ `nom` est envoyé au web service quel que soit son
contenu. Charge au web service de savoir les traiter.

### Configuration

```ini
[use]
plugin = basics
plugin = analytics

[map]
path = cities

[map/assign]
path = value.nom_enriched
value = get('value.nom')

[map/expand]
path = value.nom_enriched
size = 100

[map/expand/URLConnect]
url = https://webservice.url
timeout = 1000
noerror = true

```

## Sous chemin avec valeur multiple dans valeur multiple

### Données

```json
{ 
  "cities": [
  { 
    "nom": "Nancy",
    "quartier": [ "Boudonville", "Scarpone", "Libération" ]
   },
  { 
    "nom": "Paris",
    "quartier": ["Saint-Germain", "Halles", "Palais-Royal"]
  }
  ]
}
```

Tous les éléments de chaque champ `quartier` sont envoyés au web service quel
que soit leur contenu. Charge au web service de savoir les traiter.

### Configuration

```ini
[use]
plugin = basics
plugin = analytics

[map]
path = cities

[map/assign]
path = value.quartier_enriched
value = get('value.quartier')

[map/expand]
path = value.quartier_enriched
size = 100

[map/expand/exploding]

[map/expand/expand]
path = value
size = 100

[map/expand/expand/URLConnect]
url = https://webservice.url
timeout = 1000
noerror = true

[map/expand/aggregate]

```

## Sous chemin avec valeur multiple (objet dans valeur multiple

### Données

```json
{ 
  "villes": [
  { 
    "nom": "Nancy",
    "quartiers": [
        { id: 1, nom: "Boudonville" },
        { id: 2, nom: "Scarpone" },
        { id: 3, nom: "Libération" }
    ]
   },
  { 
    "nom": "Paris",
    "quartiers": [
        { id: 1, nom: "Saint-Germain" },
        { id: 2, nom: "Halles" },
        { id: 3, nom: "Palais-Royal" }
    ]
  }
  ]
}
```

Tous les éléments `nom` de chaque champ `quartier` sont envoyés au web service quel
que soit leur contenu. Charge au web service de savoir les traiter.

### Configuration

```ini
[map]
path = villes

[map/map]
path = quartiers

[map/map/assign]
path = nom_enriched
value = get('nom')

[map/map/expand]
path = nom_enriched
size = 10

[map/map/expand/URLConnect]
url = https://webservice.url
retries = 3
timeout = 3000
```


## Notes

- L'imbrication d'instructions peut également s'écrire avec des points (ou tout
  autre caractères). Exemple: `[expand/expand/expand/exploding]` =\>
  `[./././exploding]`
