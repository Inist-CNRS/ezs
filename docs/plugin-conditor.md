# conditor

## Présentation

Ce plugin est propose une série d'instructions pour traiter (aligner les
affiliations avec le [RNSR](https://appliweb.dgri.education.fr/rnsr/)), requêter
les documents de l'API
[Conditor](https://wiki.conditor.fr/conditor/index.php/Conditor_en_bref).

## installation

```bash
npm install @ezs/conditor
```

## Scripts

```bash
$ ./bin/affAlign.js < data/1000-notices-conditor-hal.json | ./bin/compareRnsr.js
recall: 0.7162356321839081
correct: 997
total: 1392
```

## usage
