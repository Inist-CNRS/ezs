# ezs

> NodeJS streaming processing system.

## Présentation

@ezs est un cadre logiciel visant à utiliser les
[`Stream`s](https://nodejs.org/api/stream.html) proposées par NodeJS de manière
simple, distante et réutilisable.  
Sa finalité est de transformer des millions d’objets Javascript (JSON) tout en
évitant de charger en mémoire l’ensemble des données à transformer.  
Il devient ainsi possible d’écrire des chaînes de transformation simplement,
sans débordement de mémoire, sans connaissance particulière des problématiques
de _backpressure_ (refoulement) et en gérant automatiquement la montée en
charge.  

Toute proportion gardée, @ezs propose en NodeJS un traitement des données dans
la même philosophie que le système [Apache Spark
Streaming](https://spark.apache.org/streaming/).

## Fonctionnalités

- des instructions écrites comme de simples fonctions Javascript (pas d’usage
  des classes Stream),
- des instructions utilisables dans un `pipeline` NodeJS standard,
- un système de gestion des erreurs homogène entre chaque instruction,
- un packaging permettant de regrouper et distribuer les instructions dans des
  paquets NPM,
- un usage des instructions via des fichiers au format `.ini`
  ([DSL](https://fr.wikipedia.org/wiki/Domain-specific_programming_language))
- un usage des instructions à distance via un mode
  [RPC](https://fr.wikipedia.org/wiki/Remote_procedure_call)

## Exemples

Le meilleur exemple d’usage d’@ezs est celui fait pour le logiciel
[Lodex](https://lodex.inist.fr) pour lequel le système a été conçu.

L’ensemble des scripts de transformation et de reformatage sont consultables
dans un dépôt dédié <https://github.com/Inist-CNRS/lodex-extended/>

## Participer

Pour améliorer, corriger @ezs n'hésitez pas à créer une [Pull
Request](https://github.com/Inist-CNRS/ezs/pulls).
