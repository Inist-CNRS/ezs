# Serveur

## Démarrage

Un serveur `ezs` se lance sur un répertoire donné, chaque fichier .ini de ce répertoire deviendra un point d'entrée pour le traitement de données


```bash
ezs -d  ./my_ini-files/
```

## Routes

### GET /

Cette route produit un fichier `swagger.json` qui liste toutes routes disponibles dans le serveur. Chaque route doit correspondre à un fichier .ini du répertoire indiqué au lancement.

L'usage d'une interface Swagger (swagger-ui) permet de tester le serveur.

### DELETE /

Cette route permet d'arreter un traintement en cours à partir de l'indetifiant de traitment `x-request-id` fourni dans l'entête HTTP de chaque réponse HTTP.
L'identifiant est à fournir dans un fichier JSON:

```json
{
    "x-request-id": "dffsdezaefdtrz"
}
```
### GET /metrics

Cette route est activée avec l'option `--metrics`, elle permet de surveiller l'activité du serveru avec [Prometheus](https://prometheus.io/docs/introduction/overview/)


### POST /nom_du_fichier.ini

Cette route permet de lancer le traitment sur les données envoyées avec le fichier .ini indiqué dans le nom de la route.


## Interface de tests

Il est possible de tester son serveur avec l'interface https://editor.swagger.io/ en indiquant l'URL de son serveur dans le menu "Import URL"


### Configuration

Le serveur EZS peut être configuré en ligne de commandes ou avec des variables d’environnement. Les paramètres/variables disponibles sont :

#### EZS_MAIN_STATEMENT

Permet de modifier l'instruction qui sera utilisée pour exécuter le script demandé. Par défaut,  [delegate] est utilisé
Ce paramètre peut-être modifier directement par le programme ` stress.sh`

#### EZS_NSHARDS

Permet de modifier le nombre de documents en mémoire tampon.

Ce paramètre à peu d'influence.

#### EZS_CONCURRENCY

Règle plusieurs traitements, dont la taille de file d'attente des documents à traiter, qui est ensuite traitée en parallèle.

Ce paramètre est par défaut égal au nombre de CPUs disponibles sur la machine. Il semblerait que l'on obtient de meilleurs résultats en réduisant ce paramètre. Par exemple, dans le script pd.ini la valeur a été volontairement surchargée pour être fixée arbitrairement à 5.

#### EZS_ENCODING

Permet de modifier l'encodage des données lors d'un échange externe (requête http client/serveur & serveur/client) et interne échange entre threads ou en entre process. Par défaut, Gzip est utilisé pour encoder les données

