#!/usr/bin/python
import sys
import time
import json
sys.stderr.write("Python loading...")
time.sleep(5)
sys.stderr.write("done.\n")
for line in sys.stdin:
    data = json.loads(line)
    data['value'] = data['value'].upper()
    sys.stdout.write(json.dumps(data))
    sys.stdout.write("\n")
