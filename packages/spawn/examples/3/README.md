### usage

```bash

# Start the server, don't forget to stop it! (use fg to regain control)
ezs -d  . &

# Send data for batch processing
cat input.tar.gz |curl --data-binary @-  -H "X-Hook: https://webhook.site/dce2fefa-9a72-4f76-96e5-059405a04f6c" "http://localhost:31976/process" > output.json

# When the hook is triggered, you can retrieve the result
cat output.json |curl --data-binary @- "http://localhost:31976/retrieve" > output.tar.gz

 ```

