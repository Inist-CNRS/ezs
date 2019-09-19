## ezs

> NodeJS streaming processing system.

## Présentation

@ezs un cadre logiciel visant utiliser les `stream` proposés par NodeJS de manière simple, distante et réutilisable. Sa finalité est de transformer des millions d’objet Javascript  (JSON) tout évitant de charger en mémoire l’ensemble des données à transformer.  Il devient ainsi possible d’écrire des chaînes de transformation simplement, sans débordement de mémoire, sans connaissance particulière des problématiques de “backpressure” et en gérant automatiquement la montée en charge.

Toute proportion gardée, @ezs propose en NodeJS un traitement des données dans la même philosophie que le système Apache Spark Streming.

## Fonctionnalités

- des instructions écrites comme de simples fonctions Javascript (pas d’usage des  Class stream)
   - des instructions utilisables dans un `pipeline` NodeJS standard.
- un système de gestion des erreurs homogène entre chaque instruction
- un packaging permettant de regrouper et distribuer les instructions dans des paquets NPM
- un usage des instructions via des fichiers au format .ini ([DSL](https://fr.wikipedia.org/wiki/Domain-specific_programming_language))
- un usage des instructions à distance via un mode [RPC](https://fr.wikipedia.org/wiki/Remote_procedure_call)

## Exemples

Le meilleur exemple d’usage d’@ezs est celui fait pour le logiciel [Lodex](https://lodex.inist.fr) pour lequel le système a été conçu.

L’ensemble des scripts de transformation et de reformatage sont consultables dans un dépôt dédié [https://github.com/Inist-CNRS/lodex-extended/] 



## Participer

Pour améliorer, corriger @ezs n'hésitez pas à créer une [Pull Request](https://github.com/Inist-CNRS/ezs/pulls). 