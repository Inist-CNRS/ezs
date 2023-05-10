#!/bin/bash
while IFS='$\n' read -r line; do
    >&2 echo "STEP1 recevied : ${line}"
    echo "{\"step\": 1}"
done < <(cat -)
