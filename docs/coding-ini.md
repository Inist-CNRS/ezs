# Fonctionnement d’un fichier .ini

## Présentation

Par nature un fichier .ini est descriptif, il permet facilement d’ordonnancer une suite de traitements. néanmoins il est très rarement possible de décrire une chaîne de traitements sans un paramétrage dynamique et contextuel des traitements. Pour permettre d’adapter les traitements aux données , de paramétrer les traitements à des variables d’environnement. ezs propose de calculer les valeurs des paramètres via un chaînage de fonction(macro) prédéfini.

Toutes les valeurs des paramètres d’une section sont dynamiques.

## Valeurs statiques

Pour donner une valeurs statiques à un paramètre, il suffit de renseigner de manière “naturelle” ezs se charge ensuite de dfinir automatique son type.


### Chaine de caratères
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
### Booleans
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
param4 = fix('Voici ', 'valeur', ' ', 'concaténée')
```


## Valeurs dynamiques

### Fonctions standards

Il est possible de calculer une valeur à partir de l'item courant (object JSON reçu) pour cela ezs utilise le mécanisme de chaînage de fonctions proposés par [lodash](https://lodash.com/docs/4.17.15#chain)

###  à partir d'un champ de l'objet courant(reçu)
```ini
[STATEMENT]
param1 = get('nom_du_champ').split('--').head()
param2 = fix('1.234')
param3 = fix(1234)
param4 = fix('Voici ', 'valeur', ' ', 'concaténée')
```

###  à partir d'une variable d'environment 
```ini
[STATEMENT]
param1 = env('nom_du_champ').lowerCase().padEnd(6, '__')
```

### accèder à l'objet courant comme paramètre

Le mot clé réservé ```self.```  permet d’accèder en lecture à l’objet courant, Idéalement cela permet de récupérer la valeur d’un champ pour l’utiliser comme paramètre d’une fonction.
```ini
[STATEMENT]
param1 = get('mapping').filter({'English name': self.enLabel}).first().get('alpha-2 code')
```

