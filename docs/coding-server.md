
# Serveur

Les fichiers .ini peuvent être transformés en webservice. Plus globalement, ezs propose de transformer un répertoire et son arborescence en site web proposant une API REST.
Chaque fichier devient un point d'entrée pour un service de transformation de données en streaming.

Les fichiers sont appelés via une méthode POST, le contenu de la requête alimenté en entrée la chaîne de traitements décrite dans le fichier .ini.



## Démarage

Un serveur `ezs` se lance sur un répertoire donné, chaque fichier .ini de ce répertoire deviendra un point d'entrée pour le traitement de données

## Swagger

Un fichier swagger.json est proposé à la racine du serveur.
La documentation de chaque point d'entrée est à saisir dans chaque fichier .ini

## Configuration

### Content-type

Chaque point d'entrée peut spécifier un content-type particulier en le précisant
dans la variable mimeType=

Exemple :

```ini
mimeType=text/CSV

[use]
plugin = basics

[JSONParse]
separator = *

[CSVString]
separator = ,
```









