# Fjord Server

## What is it?

This is the API Proxy Server that subscribes to a Redis pub-sub on AWS, and republishes messages to all connected clients. The Redis pub-sub itself receives messages from the Fjord Consumer, which gets messages from your Kafka cluster.

## Docker locations

https://hub.docker.com/r/fjordframework/server
