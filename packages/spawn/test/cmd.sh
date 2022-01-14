#!/bin/bash
while IFS='$\n' read -r line; do
    echo "${line^^}"
done < <(cat -)
