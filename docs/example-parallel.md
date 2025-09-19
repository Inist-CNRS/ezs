# Parallèlisation de traitements

Le système de flux proposé par Node.js permet un traitement en continu d'un ensemble de données. Plusieurs instructions sont donc exécutées en même temps en fonction du nombre d'items présents dans un flux de traitement.
Il est possible d'aller plus loin pour traiter un  maximum d'éléments en même temps.

Voici plusieurs exemples montrant comme traiter un fichier `shared.ini` contenant des instructions en essayant de maximiser le nombre d'objet à traiter en même temps.

Les performances varient selon les techniques, une benchmark compartatif est disponible à cette adresse : https://github.com/touv/ezs-benchmark/tree/main

La troisième méthode est la plus rapide.

## On regroupe les objets par lot et on applique les traitements dans un thread séparé.


``` ini
[use]
plugin = @ezs/basics

[JSONParse]
separator = *

[group]
path = value
size = 5

[detach]
file = ./shared.ini
prepend = ungroup?path=value
append = group?size=5&path=value

[ungroup]
path = value

[dump]
indent = true
```


## On ventile les objets dans 5 sous-flux différents
``` ini

[use]
plugin = @ezs/basics

[JSONParse]
separator = *

[parallel]
concurrency = 5
file = ./shared.ini

[dump]
indent = true
```


## On ventille les objets dans 5 sous-flux différents qui s'excute chacun dans un thread séparé
``` ini
[use]
plugin = @ezs/basics

[JSONParse]
separator = *

[parallel]
concurrency = 5
[parallel/detach]
file = ./shared.ini

[dump]
indent = true
```




