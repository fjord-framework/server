const express = require('express');
const cors = require('cors');
const redis = require('redis');
require ('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const {PORT, REDIS_PORT, REDIS_HOST, JWT_KEY, SEC_PER_PULSE} = process.env;

const clients = {};

let pulse = parseInt(SEC_PER_PULSE, 10) * 1000
if (Number.isNaN(pulse) || pulse < 10000) pulse = 25000 
// 10 seconds is min user can set
// if blank or less than 10s, reset to 25s

const HEADERS = {
  'Content-Type': 'text/event-stream',
  'Connection': 'keep-alive',
  'Cache-Control': 'no-cache',
};

const redisSubscriber = redis.createClient(REDIS_PORT, REDIS_HOST);

redisSubscriber.on('connect', () => {
  redisSubscriber.subscribe('redis'); // subscribe to redis topic (1 topic only)
  console.log(`Connected to redis at ${REDIS_PORT}`);
});

redisSubscriber.on('message', (channel, message) => {
  const data = JSON.parse(message);
  console.log(`${timestamp()} --> from Redis ${channel}: ${message}`)
  sendNewDataToAllClients(data.topic, message);
  if (data.topic !== 'all') sendNewDataToAllClients('all', message);
});

function registrationHandler(req, res, next) {
  const {topic, id} = req.params

  const header = req.header('Authorization');
  if (!topic || !id || !header) {
    res.status(400).send({code: 400, status: 'Missing some registration parameters'});
    return
  }

  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || typeof token !== 'string') {
    res.status(401).send({code: 400, status: 'Invalid JWT header authentication syntax'});
    return
  }

  try {
    jwt.verify(token, JWT_KEY);
    const newClient = {id, token} 
    if (!clients[topic]) clients[topic] = []
    clients[topic].push(newClient);
    res.status(200).send({code: 200, status: "registered"});
  } catch {
    res.status(403).send({code: 403, status: 'Invalid or expired token.'});
  }
}

function httpStreamHandler(req, res, next) {
  const {topic, id, token} = req.params
  let client
  if (clients[topic]) client = clients[topic].find(c => c.token === token && c.id === id)
  if (client) {
    connectClient(topic, client, req, res)
  } else {
    res.status(400).send({code: 400, status: "Client must first register and pass JWT authentication"})
  } 
}

function connectClient(topic, client, req, res) {
  res.writeHead(200, HEADERS);
  client.res = res;
  console.log(`${timestamp()} ${client.id} connected to: ${topic}`)
  reportOnAllClients()
  req.on('close', () => {
    clients[topic] = clients[topic].filter(c => c.id !== client.id)
    console.log(`${timestamp()} ${client.id} disconnected from: ${topic}`)
    reportOnAllClients()
  });
}

function sendNewDataToAllClients(topic, newData) {
  if (!clients[topic]) clients[topic] = [];
  clients[topic].forEach(c => c.res.write(`data: ${newData}\n\n`));
}

function reportOnAllClients() {
  let totalConnections = 0
  const topicsSummary = Object.getOwnPropertyNames(clients).map(topic => {
    totalConnections += clients[topic].length
    return ('(' + clients[topic].length + ') ' + topic)
  })
  console.log(`${totalConnections} total clients: ${topicsSummary.join(', ')}`)
}

// sending a heartbeat/pulse is necessary to regularly check on health of all connections
function pulseToAllClients() {
  const topics = Object.getOwnPropertyNames(clients)
  topics.forEach(t => {
    clients[t].forEach(c => c.res.write(`:\n\n`))
  })
}

//regularly send pulse to check connection
setInterval(pulseToAllClients, pulse)

function timestamp(){
  return new Date()
};

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