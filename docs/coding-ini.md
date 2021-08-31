# Fonctionnement d’un fichier .ini

## Présentation

Par nature un fichier `.ini` est descriptif, il permet facilement d’ordonnancer
une suite de traitements.

Néanmoins il est très rarement possible de décrire une chaîne de traitements
sans un paramétrage dynamique et contextuel des traitements.

Pour permettre d’adapter les traitements aux données, de paramétrer les
traitements grâce à des variables d’environnement, `ezs` propose de calculer les
valeurs des paramètres via un chaînage de fonctions (macros) prédéfini.

Toutes les valeurs des paramètres d’une section sont dynamiques.

## Valeurs statiques

Pour donner une valeur statiques à un paramètre, il suffit de la renseigner de
manière "naturelle". `ezs` se charge ensuite de définir automatiquement son
type.

### Chaîne de caractères

```ini
[STATEMENT]
param1 = valeur une
```

### Chiffres et Nombres

```ini
[STATEMENT]
param1 = 1234
param2 = 1.234
```

### Booléens

```ini
[STATEMENT]
param1 = true
param2 = false
```

### Caractères spéciaux et autres cas

```ini
[STATEMENT]
param1 = fix('\n')
param2 = fix('1.234')
param3 = fix(1234)
param4 = fix('Voici ', 'valeur', ' ', 'concaténée').join('')
```

## Valeurs dynamiques

Il est possible de calculer une valeur à partir de l'item courant (objet JSON
reçu). Pour cela `ezs` utilise le mécanisme de chaînage de fonctions proposé par
[lodash](https://lodash.com/docs/4.17.15#chain).





### Fonctions disponibles

Toutes les fonctions chainable dans lodash sont utilisables.
`ezs` propose quelqeus fonctions supplémentaires :

#### Pour définir une valeur : fix()

Cette fonction permet notamment de saisir des caractères spéciaux (retour chariot), de s'assurer 
de du typage d'une valeur ou de créer un tableau de plusieurs valeurs :

```ini
[STATEMENT]
param1 = fix('\n')
param2 = fix('1.234')
param3 = fix(1234)
param4 = fix('Voici ', 'valeur', ' ', 'concaténée').join('')
```

#### Pour prefixer ou suffixer une valeur : prepend() , append()

Cette fonction permet notamment d'ajouter un prefix et ou un suffix à une chaine de caractères :

```ini
[STATEMENT]
param1 = fix('item').prepend('<').append('>')
param2 = get('path').prepend('Valeur champ path:')
```


### À partir d'un champ de l'objet courant (reçu)

```ini
[STATEMENT]
param1 = get('nom_du_champ').split('--').head()
```

Ici, `get('nom_du_champ')` récupère la valeur du champ `nom_du_champ` dans
l'objet reçu. C'est l'équivalent du JavaScript de `get(obj, 'nom_du_champ')`.
Voir [la documentation de lodash](https://lodash.com/docs/4.17.15#get).

### À partir d'une variable d'environnement

```ini
[STATEMENT]
param1 = env('nom_du_champ').lowerCase().padEnd(6, '__')
```

### Accéder à l'objet courant comme paramètre

Le mot clé réservé `self.`  permet d’accéder en lecture à l’objet courant.
Idéalement cela permet de récupérer la valeur d’un champ pour l’utiliser comme
paramètre d’une fonction.

```ini
[STATEMENT]
param1 = get('mapping').filter({'English name': self.enLabel}).first().get('alpha-2 code')
```
