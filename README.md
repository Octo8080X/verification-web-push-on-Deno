# verification npm web-push on Deno/Node

```sh
$ deno serve --unstable-kv --allow-read --allow-env --allow-net --watch ./main.ts

$ node ./main-node.mjs
```

Deno cannot process the sent content and an error occurs. 

Error message: `AES-GCM decryption failed`

Acknowledged by `chrome://gcm-internals/`