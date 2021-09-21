# Conversion

Voici une série d’exemples pour convertir un flux de données dans un autre format.

## Convertir du CSV en JSON

```ini
[use]
plugin = basics

[CSVParse]
separator = ,

[CSVObject]

[dump]
indent = true
```

## Convertir du TSV en JSON

```ini
[use]
plugin = basics

[CSVParse]
separator = fix('\t')

[CSVObject]

[dump]
indent = true
```

## Convertir du JSON vers CSV

```ini
[use]
plugin = basics

# JSON from elasticsearch result
[JSONParse]
separator = hits.*

[OBJFlatten]

[OBJStandardize]

[CSVString]
format = strict
```

## Convertir du RSS vers du CSV

```ini
[use]
plugin = basics

[XMLParse]
separator = /rss/channel/item
    
[OBJFlatten]

[OBJStandardize]

[CSVString]
format = strict
```

## Convertir du SKOS en CSV

```ini
[use]
plugin = basics

[XMLParse]
separator = /RDF/*
separator = /rdf:RDF/*

[SKOSObject]

[OBJStandardize]

[CSVString]
format = strict
```

## Normaliser un CSV

```ini
[use]
plugin = basics

[CSVParse]
separator = ,

[CSVObject]
[CSVString]
format = strict
```



