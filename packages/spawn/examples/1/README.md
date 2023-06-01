### usage

```bash

# Start the server, don't forget to stop it! (use fg to regain control)
ezs -d  . &

# Send data for batch processing
cat input.json |curl --data-binary @- "http://localhost:31976/webhook"|jq .

# When the webhook is triggered, it gives the result

 ```

