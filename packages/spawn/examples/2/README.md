### usage

```bash

# Start the server, don't forget to stop it! (use fg to regain control)
ezs -d  . &

# Send data for batch processing
cat input.json |curl --data-binary @- "http://localhost:31976/process" > output.json                                     

# When the webhook is triggered, get the result
cat output.json |curl --data-binary @- "http://localhost:31976/retrieve"

 ```

