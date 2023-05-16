### usage

```bash

ezs -d  . &
cat input.json |curl --data-binary @- "http://localhost:31976/webhook"|jq .

 ```

