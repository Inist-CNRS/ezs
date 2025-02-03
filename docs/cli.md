# Ligne de commande

```shell
$ ezs -h
Usage: ezs [options] [<file>|<directory>] [<file2> <file3> ...]

Options :
  --help         Affiche l'aide                                        [booléen]
  --version      Affiche le numéro de version                          [booléen]
  --verbose, -v  Make ezs more talkative, which is equivalent to setting the
                 envar to DEBUG=ezs:*,-ezs:debug,-ezs:trace
                                                      [booléen] [défaut : false]
  --logs, -l     Enable logs mode, which is equivalent to setting the envar to
                 DEBUG_COLORS=0 DEBUG=ezs:*,-ezs:debug,-ezs:trace
                                                      [booléen] [défaut : false]
  --tracer, -t   Enable tracer mode                   [booléen] [défaut : false]
  --metrics, -m  Enable metrics mode                  [booléen] [défaut : false]
  --rpc, -r      Enable RPC mode                      [booléen] [défaut : false]
  --daemon, -d   Launch daemon on a directory containing commands script
                                                          [chaîne de caractères]
  --env, -e      Execute commands with environment variables as input
                                                      [booléen] [défaut : false]
  --file, -f     Execute commands with a file as input
                                         [chaîne de caractères] [défaut : false]
  --param, -p    Environment parameters                   [chaîne de caractères]

for more information, find our manual at https://github.com/Inist-CNRS/ezs
```



## Exemples: 


```bash
$ cat ./input.csv | ezs -v mon-script.ini

$ curl http://exemple.com/data.txt | ezs ./data2json.ini | jq .
```



