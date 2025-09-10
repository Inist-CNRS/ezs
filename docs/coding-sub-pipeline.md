# Fonctionnement d’un sous flux

## Présentation

Certaines instructions proposent de réaliser un traitement sur un champ particulier avec un flux dédié et spécifique à ce champ. C'est un sous flux.

Ces instructions prennent donc en paramètre un fichier d’instructions (un fichier .ini). Pour éviter d'utiliser fun ichier séparé, il est possible de créer des instructions imbriquées qui permettront de décrire le sous flux en restant dans le même fichier.

Les instructions imbriquées s’utilisent via la syntatxe des sous sections dans un fichier .ini

Tous les sous flux partagent le même environnement que le flux principal.


## Fonctionnement

![coding-sub-pipeline](./coding-sub-pipeline.png)



## Instructions utilisant un sous flux :

- [delegate] : 1 sous flux pour tous les éléments
- [detach] : 1 sous flux pour tous les éléments dans un thread séparé
- [parallel] : N sous flux pour tous les éléments
- [swing] : 1 sous flux pour tous les éléments filtrés selon une condition
- [spaw] : 1 sous flux par élément
- [loop] : 1 sous flux par élément
- [expand] : 1 sous flux pour N éléments (N = size), seul le champ sélectionné est envoyé dans le pipeline
- [combine] : 1 sous flux pour tous les éléments, seul le champ sélectionné est comparé avec le résultat du sous flux
- [singleton] : 1 sous flux pour le premier élément

