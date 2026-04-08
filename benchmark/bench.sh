#!/bin/bash

echo "| Date | Heure | Documents 	| Requetes 	| Script 	| Statement 	| Runtime	| Temps 	| CPU (sys) 	| CPU (usr) 	|"
echo "| ---- | ----- | --------- 	| -------- 	| ------ 	| --------- 	| ------	| ----- 	| --------- 	| --------- 	|"

./stress.sh 1 1 en
./stress.sh 1 1 en "detach?encoder=concat&decoder=transit"
./stress.sh 1 1 pl
./stress.sh 1 1 pl "detach?encoder=concat&decoder=transit"
./stress.sh 1 1 pd
./stress.sh 1 1 pd "detach?encoder=concat&decoder=transit"
./stress.sh 1 1 px
./stress.sh 1 1 px "detach?encoder=concat&decoder=transit"
./stress.sh 1 1 sp
./stress.sh 1 1 sp "detach?encoder=concat&decoder=transit"

./stress.sh 10 1 en
./stress.sh 10 1 en "detach?encoder=concat&decoder=transit"
./stress.sh 10 1 pl
./stress.sh 10 1 pl "detach?encoder=concat&decoder=transit"
./stress.sh 10 1 pd
./stress.sh 10 1 pd "detach?encoder=concat&decoder=transit"
./stress.sh 10 1 px
./stress.sh 10 1 px "detach?encoder=concat&decoder=transit"
./stress.sh 10 1 sp
./stress.sh 10 1 sp "detach?encoder=concat&decoder=transit"

./stress.sh 20 1 en
./stress.sh 20 1 en "detach?encoder=concat&decoder=transit"
./stress.sh 20 1 pl
./stress.sh 20 1 pl "detach?encoder=concat&decoder=transit"
./stress.sh 20 1 pd
./stress.sh 20 1 pd "detach?encoder=concat&decoder=transit"
./stress.sh 20 1 px
./stress.sh 20 1 px "detach?encoder=concat&decoder=transit"
./stress.sh 20 1 sp
./stress.sh 20 1 sp "detach?encoder=concat&decoder=transit"

./stress.sh 100 1 en
./stress.sh 100 1 en "detach?encoder=concat&decoder=transit"
./stress.sh 100 1 pl
./stress.sh 100 1 pl "detach?encoder=concat&decoder=transit"
./stress.sh 100 1 pd
./stress.sh 100 1 pd "detach?encoder=concat&decoder=transit"
./stress.sh 100 1 px
./stress.sh 100 1 px "detach?encoder=concat&decoder=transit"
./stress.sh 100 1 sp
./stress.sh 100 1 sp "detach?encoder=concat&decoder=transit"

./stress.sh 1 10 en
./stress.sh 1 10 en "detach?encoder=concat&decoder=transit"
./stress.sh 1 10 pl
./stress.sh 1 10 pl "detach?encoder=concat&decoder=transit"
./stress.sh 1 10 pd
./stress.sh 1 10 pd "detach?encoder=concat&decoder=transit"
./stress.sh 1 10 px
./stress.sh 1 10 px "detach?encoder=concat&decoder=transit"
./stress.sh 1 10 sp
./stress.sh 1 10 sp "detach?encoder=concat&decoder=transit"

./stress.sh 10 10 en
./stress.sh 10 10 en "detach?encoder=concat&decoder=transit"
./stress.sh 10 10 pl
./stress.sh 10 10 pl "detach?encoder=concat&decoder=transit"
./stress.sh 10 10 pd
./stress.sh 10 10 pd "detach?encoder=concat&decoder=transit"
./stress.sh 10 10 px
./stress.sh 10 10 px "detach?encoder=concat&decoder=transit"
./stress.sh 10 10 sp
./stress.sh 10 10 sp "detach?encoder=concat&decoder=transit"

./stress.sh 20 10 en
./stress.sh 20 10 en "detach?encoder=concat&decoder=transit"
./stress.sh 20 10 pl
./stress.sh 20 10 pl "detach?encoder=concat&decoder=transit"
./stress.sh 20 10 pd
./stress.sh 20 10 pd "detach?encoder=concat&decoder=transit"
./stress.sh 20 10 px
./stress.sh 20 10 px "detach?encoder=concat&decoder=transit"
./stress.sh 20 10 sp
./stress.sh 20 10 sp "detach?encoder=concat&decoder=transit"

./stress.sh 100 10 en
./stress.sh 100 10 en "detach?encoder=concat&decoder=transit"
./stress.sh 100 10 pl
./stress.sh 100 10 pl "detach?encoder=concat&decoder=transit"
./stress.sh 100 10 pd
./stress.sh 100 10 pd "detach?encoder=concat&decoder=transit"
./stress.sh 100 10 px
./stress.sh 100 10 px "detach?encoder=concat&decoder=transit"
./stress.sh 100 10 sp
./stress.sh 100 10 sp "detach?encoder=concat&decoder=transit"


