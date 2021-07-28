const express = require('express');
const cors = require('cors');
const redis = require('redis');
require ('dotenv').config();
const app = express();

const Registration = require('./lib/registration');
const NotificationHandler = require('./lib/notification');
const ClientManager = require('./lib/clientManager');
const Client = require('./lib/client');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const {PORT, REDIS_PORT, REDIS_HOST, JWT_KEY, SEC_PER_PULSE} = process.env;

const clients = new ClientManager();

let pulse = parseInt(SEC_PER_PULSE, 10) * 1000;
if (Number.isNaN(pulse) || pulse < 10000) pulse = 25000;
// 10 seconds is min user can set
// if blank or less than 10s, reset to 25s

const redisSubscriber = redis.createClient(REDIS_PORT, REDIS_HOST);

redisSubscriber.on('connect', () => {
  redisSubscriber.subscribe('redis'); // subscribe to redis topic (1 topic only)
  console.log(`Connected to redis at ${REDIS_PORT}`);
});

redisSubscriber.on('message', (channel, message) => {
  const data = JSON.parse(message);
  console.log(`${new Date()} --> from redis: ${message}`);
  clients.sendNewDataToAll(data.topic, `data: ${message}\n\n`);
  if (data.topic !== 'all') clients.sendNewDataToAll('all', `data: ${message}\n\n`);
});

function registrationHandler(req, res) {
  let newReg = new Registration(req);
  let notify = new NotificationHandler(res);

  if (newReg.isValid()) {
    try {
      newReg.verifyJWT(JWT_KEY);
      const newClient = new Client(newReg.id, newReg.token, res);
      clients.addClient(newClient, newReg.topic);
      notify.clientRegistered();
    } catch {
      notify.invalidToken();
    }
  } else {
    newReg.validParams ? notify.invalidHeaders() : notify.invalidParams();
  }
}

function httpStreamHandler(req, res) {
  const {topic, id, token} = req.params;
  let notify = new NotificationHandler(res);

  let client = clients.locateClient(topic, token, id);

  if (client) {
    clients.connectClient(topic, client, res)
    clients.reportOnAll();

    req.on('close', () => {
      clients.disconnectClient(client, topic);
      clients.reportOnAll();
    })
  } else {
    notify.clientNotRegistered()
  }
}

// sending a heartbeat/pulse is necessary to regularly check on health of all connections
// regularly send pulse to check connection
setInterval(clients.pulseToAll.bind(clients), pulse);

//routes

app.get('/register/:topic/:id', registrationHandler)

app.get('/stream/:topic/:id/:token', httpStreamHandler);

// updated for ALB health check
app.get('/', (req, res) => {
  res.send('Healthy');
});

app.listen(PORT, () => {
  console.log(`listening at localhost:${PORT}`);
});