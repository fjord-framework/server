# Fjord Prototype

## What is it?

This repo contains five folders:

1. client - Contains a sample client.html file to demonstrate how a client might connect to a stream
2. consumer - The Fjord Consumer for Kafka
3. producer - Several producers for Kafka (for testing purposes -- do not include)
4. server - The Fjord API proxy that receives post requests from the Fjord Consumer and allows clients to stream data through Server-Sent-Events (SSE)
5. FjordApp - This directory contains the AWS CDK components to deploy the Fjord architecture on AWS

## Docker locations

- consumer: https://hub.docker.com/r/dockervahid/fjord-consumer
- server: https://hub.docker.com/r/dockervahid/fjord-server

## Docker run commands

- consumer
  `docker run --env-file .env -p 8080:8080 dockervahid/fjord-consumer`
- server
  `docker run -p 80:80 dockervahid/fjord-server`

## steps to connect using JWT
1. Use the CDK to deploy to AWS by following instructions in FjordApp/Readme
2. While the above is deploying, go to client folder, create a .env file and add: `JWT_KEY=jqq247gjrhvariorrbgehtcwz5k0x0slmmxndnde` (this is the private key that the AWS CDK is currently using by default)
3. When CDK is deployed, go to client folder and run `node publicKeyGen.js` to get a public key (i.e. a token), copy and paste this token into the appropriate `token` variable in `client.html`
4. Look for & copy the domain name of the AWS server load balancer (_without_ the `http://` part)
5. Open the client.html file in browser, input the load balancer URL, and stream! Check console for any messages. By default, entering just the URL will let you stream from all topics. If you want to stream from a particular topic, enter URL/topic
6. By default, your token is valid for 1 minute. After it expires, you must repeat step 3 above
7. Go to the logs for the server instance through the AWS Console (browser)
8. Produce some records using the files in the /producer folder, and see them appear on both the logs and the client.html file
