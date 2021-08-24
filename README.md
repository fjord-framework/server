<p align="center">
  <img src="./readme_materials/fjord.svg" width="500" height="200" />
</p>

# Fjord Server

## What is the Fjord Server?

The Fjord Server is a web server that subscribes to a Redis channel and publishes new messages to all connected clients. The Redis pub-sub itself receives messages from the Fjord Consumer, which gets messages from your Kafka cluster.

## How is the Fjord Server Deployed?

It's possible to run the Fjord server locally. However, the dockerized server is generally intended to be deployed with the entire Fjord infrastructure on AWS, which can be done without using any code in this repo. If you'd like to deploy the entire Fjord infrastructure, please see the [deploy](https://github.com/fjord-framework/deploy) repo. If you wish to test the Fjord server locally, please continue reading below.

## How is the Fjord Server Run Locally?

### Prerequisites

#### Redis

Before running the Fjord server, it is necessary to install and run Redis when running the server locally. To do so, you can use the official Docker [image](https://hub.docker.com/_/redis/) or follow Redis's [Quickstart instructions](https://redis.io/topics/quickstart). Make sure Redis is running prior to continuing.

### Installation Steps

1. `git clone https://github.com/fjord-framework/server`
2. `cd server`
3. `touch .env`

In your `.env` file, specify the following variables appropriately. `PORT` is the port on your machine where the Fjord server will be listening. If you omit `SEC_PER_PULSE`, a heartbeat will be regularly sent to connected clients every 25 seconds. If you're not using JSON web tokens, you can omit `JWT_KEY`. `API_TOPICS` should be a space-delimited list of 1 or more topics that you wish to be available to end users. These topics can be any name of your choosing, provided they don't include spaces. They do not need to match the names of the Kafka topics you're choosing to expose.

```
REDIS_PORT=6379
REDIS_HOST=localhost
PORT=80
SEC_PER_PULSE=25000
API_TOPICS=all
JWT_KEY=
```

4. From the `server/` directory, enter `npm start` or `node server.js`. You should see something like the output below, confirming that Redis is connected and the server is listening at the port you specified.

```
>> node server.js
listening on port: 80
connected to redis on port 6379
```

## Next Steps

Congratulations! Your Fjord server is now running locally and is able to connect to Redis. A good next step to continue with Fjord locally is to set up a Kafka cluster and run the Fjord consumer. Please see the [consumer](https://github.com/fjord-framework/consumer) repo.

## Docker locations

https://hub.docker.com/r/fjordframework/server
