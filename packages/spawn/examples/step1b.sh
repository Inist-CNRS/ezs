#!/bin/bash
while IFS='$\n' read -r line; do
    >&2 echo "STEP1b recevied : ${line}"
    echo "{\"step\": 3}"
done < <(cat -)
