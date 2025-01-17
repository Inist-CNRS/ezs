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

Pour donner une valeur statique à un paramètre, il suffit de la renseigner de
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

Il est possible de calculer une valeur à partir de l'item courant (objet JSON reçu). Pour cela `ezs` utilise le mécanisme de chaînage de fonctions proposé par [lodash](https://lodash.com/docs/4.17.15#chain).

Toutes les fonctions chaînables dans lodash sont utilisables. La valeur initiale de la chaine est l'objet courant sur lequel on peut appliquer des fonctions lodash de transformation.

`ezs` propose quelques fonctions supplémentaires : fix(), env(), self(), prepend(), append()

### Pour accéder à une  valeur de l'objet courant: get()
Le cas le plus courant est d'utiliser la fonction lodash get pour récupérer la valeur d'un champ de l'objet courant. Exemple :

```ini
[STATEMENT]
param1 = get('nom_du_champ').split('--').head()
```
Ici, `get('nom_du_champ')` récupère la valeur du champ `nom_du_champ` dans l'objet qui sera utilisé par l'instruction [STATEMENT] . C'est l'équivalent du JavaScript `_.get(obj, 'nom_du_champ')`. Voir [la documentation de lodash](https://lodash.com/docs/4.17.15#get).

En interne, pour l'exemple précédent `ezs` exécute l'instruction lodash suivante : 
```js
_.chain(objet_courant).get('nom_du_champ').split('--').head().Value()
```

### Pour définir une valeur : fix()

Cette fonction spécifique à `ezs` permet notamment de saisir des caractères spéciaux (retour
chariot), de s'assurer du typage d'une valeur ou de créer un tableau de
plusieurs valeurs :

```ini
[STATEMENT]
param1 = fix('\n')
param2 = fix('1.234')
param3 = fix(1234)
param4 = fix('Voici ', 'valeur', ' ', 'concaténée').join('')
```

### Pour préfixer ou suffixer une valeur : prepend(), append()

Ces fonctions spécifiques à `ezs` permettent notamment d'ajouter un prefixe (ou un suffixe) à une chaîne de caractères :

```ini
[STATEMENT]
param1 = fix('item').prepend('<').append('>')
param2 = get('path').prepend('Valeur champ path:')
```

### Pour accéder à des variables d'environnement: env()

Cette fonction spécifique à `ezs` permet de récupérer la valeur d'une variable d’environnement. Les variables d'environnements disponibles sont  :

#### Variables d'environnement externes
```bash
$ MA_VARIABLE=valeur externe
$ ezs script.ini < input 
```
*script.ini :*

```ini
[STATEMENT]
param1 = env('MA_VARIABLE')
param2 = env('PATH')
```
#### Paramètres  à l'exécution
```bash
$ ezs -p param1=val1 -p param2=val2 script.ini < input 
```
*script.ini :*

```ini
[STATEMENT]
param1 = env('param1')
param2 = env('param2')
```
#### Variables globales

L'instruction [env] permet de stocker, modifier toutes les variables d'environnement

```ini
[env]
path = options.une
value = fix("valeur de l'option une")
path = options.deux
value = fix("valeur de l'option deux")


[STATEMENT]
param1 = env('options.une')
param2 = env('options.deux')
```

### Paramètres  de l'URL

Dans le cas d'un serveur `ezs` les paramètres de requetes HTTP reçues en entrée du script .ini sont disponibles à travers les variables d'environement. 

Par exemple, pour la requete : POST /v1/exemple/?param1=val1&param2=val2
```ini
[STATEMENT]
param1 = env('param1')
param2 = env('param2')
```

Il est également possible d'accèder aux entetes et aux paramètres de la requete HTTP . Exemple :  
```ini
[STATEMENT]
param1 = env('headers.x-token')
param2 = env('request.pathName')
```
 

### Pour accéder à l'objet courant: self()

Cette fonction permet de récupérer la valeur de l'objet qui sera envoyée en entrée de l'instruction.

```ini
[STATEMENT]
param1 = self().omit('secret')
```

Il peut être parfois utilise d'accèder à l'objet courant sous forme d'une variable. Le mot clé réservé `self.`  permet d’accéder en lecture à l’objet courant.  
Idéalement cela permet de récupérer la valeur d’un champ pour l’utiliser comme paramètre d’une fonction.

```ini
[STATEMENT]
param1 = get('mapping').filter({'English name': self.enLabel}).first().get('alpha-2 code')
```