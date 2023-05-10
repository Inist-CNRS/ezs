#!/bin/bash
while IFS='$\n' read -r line; do
    >&2 echo "STEP1a recevied : ${line}"
    echo "{\"step\": 2}"
done < <(cat -)
