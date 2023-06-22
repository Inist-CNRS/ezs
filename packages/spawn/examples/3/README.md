### usage

```bash

# Start the server, don't forget to stop it! (use fg to regain control)
ezs -d  . &

# Send data for batch processing
cat input.tar.gz |curl --data-binary @- "http://localhost:31976/process" > output.json

# When the corpus is processed, get the result
cat output.json |curl --data-binary @- "http://localhost:31976/retrieve"

 ```

