# Conditor Data

## URL used

| Fields | Value                         |
|--------|-------------------------------|
| Method | GET                           |
| URL    | https://api-integ.conditor.fr |
| Path   | /v1/records?q=...             |

## URL parameters

| name      | value                                         |
|-----------|-----------------------------------------------|
| q         | `"source:hal AND authors>affiliations>\"*\""` |
| page_size | 10                                            |
| includes  | authors,xPublicationDate                      |
| debug     |                                               |

## curl

```bash
 curl 'https://api-integ.conditor.fr/v1/records?q=%22source%3Ahal%20AND%20authors%3Eaffiliations%3E%5C%22*%5C%22%22&page_size=10&includes=authors%2CxPublicationDate&access_token=ey...&debug' > data/10-notices-conditor-hal.json
 ```
