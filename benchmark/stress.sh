#!/bin/bash

SIZE="${1:-10}"
ROUND="${2:-1}"
SCRIPT="${3:-en}"
INPUT="./input/data-${SIZE}.json"
OUTPUT="./output/out-${SIZE}-${SCRIPT}"
HOST="http://localhost:31976"
ENTRYPOINT="/${SCRIPT}"
NODE_VERSION=`${EZS_RUNTIME:=node} -v`
EZS="./node_modules/@ezs/core/bin/ezs"
MAIN_STATEMENT="${4:-delegate}"
HORODATAGE=`date "+%F | %T"`

if [ ! -f "${INPUT}" ]; then
	echo "The file does not exists."
	exit 1
fi

rm "${OUTPUT}-*" >/dev/null 2>&1

EZS_MAIN_STATEMENT="${MAIN_STATEMENT}" ${EZS} -v -d ./scripts/ 2> ${OUTPUT}-server.log  &
SERVER_PID="$!"
sleep 5


echo -n -e "| ${HORODATAGE} | ${SIZE} \t| ${ROUND} \t| ${SCRIPT} \t| ${MAIN_STATEMENT} \t| ${NODE_VERSION}\t|"
TIMEFORMAT=$' %R \t| %U \t| %S \t|'
# --write-out "\nquery #{}:\t %{time_total} secs\n" \
export HOST ENTRYPOINT INPUT OUTPUT ROUND

{ time (seq 1 ${ROUND} | xargs -n1 -P4 -I{} bash -c '
  http_code=$(curl --request "POST" \
    --url "${HOST}${ENTRYPOINT}" \
    --header "Content-Type: application/json" \
    --silent \
    --write-out "%{http_code}" \
    --data "@${INPUT}" \
    --output "${OUTPUT}-$1.json" \
    2>> "${OUTPUT}-errors.log")
  if [ "$http_code" -ge 400 ] 2>/dev/null; then
    echo "[$1] HTTP error: $http_code" >> "${OUTPUT}-errors.log"
  fi
' _ {} ); } 2>&1

kill -s TERM ${SERVER_PID}
sleep 2

