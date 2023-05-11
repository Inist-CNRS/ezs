#!/bin/bash
while IFS='$\n' read -r line; do
	FILENAME=$(echo $line|node -pe 'JSON.parse(fs.readFileSync(0)).filename')
	RESULT=$(wc -l ${FILENAME}|cut -f 1 -d" ")
	echo "{\"size\": ${RESULT}, \"filename\":\"${FILENAME}\"}"
done < <(cat -)
