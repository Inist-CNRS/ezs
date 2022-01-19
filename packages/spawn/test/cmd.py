#!/usr/bin/python
import sys
import json
sys.stderr.write("FIFO Python processing for each line\n")
for line in sys.stdin:
    data = json.loads(line)
    data['value'] = data['value'].upper()
    sys.stdout.write(json.dumps(data))
    sys.stdout.write("\n")
