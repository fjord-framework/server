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

function verifyAndRegisterUser(topic, id, token, res) {
  let newReg = new Registration(topic, id, token);
  let notify = new NotificationHandler(res);

  if (newReg.hasValidTopic()) {
    try {
      newReg.verifyJWT(JWT_KEY);
      console.log('verified')
      return newReg.id;
    } catch {
      console.log('invalid token', token)
      // notify.invalidToken();
    }
  } else {
    console.log('invalid topic')
    // notify.invalidTopic();
    return false;

  }
  return false;
}

function httpStreamHandler(req, res, next) {
  const {topic, id, token} = req.params;
  let notify = new NotificationHandler(res);

  let registrationId = verifyAndRegisterUser(topic, id, token, notify);
  console.log(registrationId)
  if (registrationId) {
    const newClient = new Client(registrationId, token);
    clients.connectClient(newClient, topic, res);
    // notify.clientConnected(); 

    console.log('connected')
    clients.reportOnAll();

    req.on('close', () => {
      clients.disconnectClient(newClient, topic);
      clients.reportOnAll();
    })
  } else {
    console.log('not connected')
    // notify.clientNotConnected()
  }
}

// sending a heartbeat/pulse is necessary to regularly check on health of all connections
// regularly send pulse to check connection
setInterval(clients.pulseToAll.bind(clients), pulse);

//routes

app.get('/stream/:topic/:id/:token', httpStreamHandler);

// updated for ALB health check
app.get('/', (req, res) => {
  res.send('Healthy');
});

app.listen(PORT, () => {
  console.log(`listening at localhost:${PORT}`);
});