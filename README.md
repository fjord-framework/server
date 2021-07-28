# Fjord Server

## What is it

Fjord server is a SSE server and as part of the Fjord realtime framework.

Fjord server is designed to scale and uses Redis to publish messages to all clients connected to the subscribed servers. This means you must have a running instance of Redis for full functionality.

The Redis pub-sub itself receives messages from the [Fjord Consumer](https://github.com/fjord-framework/consumer), which gets messages from your Kafka cluster.


## Docker location

- v2: https://hub.docker.com/r/sophiecodes/server_v1
- v1: https://hub.docker.com/r/sophiecodes/server
- v0: https://hub.docker.com/r/dockervahid/fjord-server

## How to use Fjord Server

### Environment variables

The following environment variables must be configured:
  - `PORT`- e.g. 3000
  - `REDIS_PORT` - e.g. 6379
  - `REDIS_HOST` - e.g. localhost
  - `JWT_KEY` - the private key
  - `SEC_PER_PULSE` - e.g. 30


### In this version

Server logic is refactored with an OOP approach. 

Sample client side code:
```
<script>

const token = ""; // public key

const input = window.prompt("Enter host/topic:"); 

let [host, topic] = input.split("/");
if (!topic) topic = "all";
host = host.length ? "http://" + host : "http://localhost:3000";

const id = ""; // userId

function stream() {
  const URL = `${host}/stream/${topic}`;
  const streamURL = `${URL}/${id}/${token}`;
  const events = new EventSource(streamURL);

  events.onerror = e => { ... }
  events.onmessage = e => { ... }
}
```