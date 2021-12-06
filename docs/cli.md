# Ligne de commande

```shell
$ ezs -h
Usage: ezs [options] [<file>|<directory>] [<file2> <file3> ...]

Options:
  --help         Affiche de l'aide                                     [booléen]
  --version      Affiche le numéro de version                          [booléen]
  --verbose, -v  Enable debug mode with DEBUG=ezs      [booléen] [défaut: false]
  --daemon, -d   Launch daemon on a directory containing commands script
                                                           [chaine de caractère]
  --slave, -l    Launch slave daemon to execute remote commands        [booléen]
  --server, -s   Server to dispach commands                [chaine de caractère]
  --env, -e      Execute commands with environement variables as input
                                                       [booléen] [défaut: false]
  --file, -f     Execute commands with a file as input
                                           [chaine de caractère] [défaut: false]

for more information, find our manual at https://github.com/Inist-CNRS/ezs
```
