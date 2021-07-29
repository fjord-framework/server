const express = require('express');
const cors = require('cors');
require ('dotenv').config();

const ClientsManager = require('./lib/clientsManager');
const Publisher = require('./lib/publisher');

const app = express();
app.use(cors());

const {PORT, REDIS_PORT, REDIS_HOST, JWT_KEY, SEC_PER_PULSE, API_TOPICS} = process.env;

const clients = new ClientsManager(JWT_KEY, API_TOPICS);
const publisher = new Publisher(REDIS_PORT, REDIS_HOST, SEC_PER_PULSE, clients.list);
publisher.listenAndPublish();

app.get('/stream/:topic/:id/:token', clients.stream.bind(clients));

// for AWS Application Load Balancer health check
app.get('/', (req, res) => res.send('Healthy'));

app.listen(PORT, () => console.log(`listening on port: ${PORT}`));
