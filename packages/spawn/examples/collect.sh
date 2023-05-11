#!/bin/bash
FILENAME="/tmp/data-$RANDOM.dat"
while IFS='$\n' read -r line; do
	echo ${line} >> ${FILENAME}
done < <(cat -)
echo "{\"filename\": \"${FILENAME}\"}"
