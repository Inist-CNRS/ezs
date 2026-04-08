#!/bin/bash

SCRIPT="${1:-en}"
SIZE="${2:-10}"
INPUT="./input/data-${SIZE}.json"
HOST="http://localhost:31976"
ENTRYPOINT="/${SCRIPT}"

if [ ! -f "${INPUT}" ]; then
	echo "The file does not exists."
	exit 1
fi

curl --verbose \
    --request "POST" \
	--url "${HOST}${ENTRYPOINT}" \
	--header "Content-Type: application/json"  \
	--data "@${INPUT}" 

