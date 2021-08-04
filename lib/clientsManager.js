const jwt = require('jsonwebtoken');

class ClientsManager {
  constructor(JWT_KEY, API_TOPICS) {
    this.initializeTopicsAndClientList(API_TOPICS);
    this.initializeResponseHeaders();
    this.JWT_KEY = (JWT_KEY || false);
  }

  initializeTopicsAndClientList(API_TOPICS) {
    this.topics = API_TOPICS.split(' ');
    this.topics.push('all');
    this.list = {};
    this.topics.forEach(topic => this.list[topic] = []);
  }

  initializeResponseHeaders() {
    this.responseHeaders = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
    };
  }

  stream(req, res) {
    const result = this.validateRequest(req.params);
    if (result.valid) {
      const {topic, id} = req.params;
      const client = this.addClient(topic, id);
      this.connectClient(req.params.topic, client, req, res);
    } else {
      const {code, error} = result;
      res.status(code).send({code, error});
    }
  }

  validateRequest(params) {
    if (!this.topics.includes(params.topic)) {
      return {valid: false, code: 406, error: 'Invalid topic'};
    }
    if (!this.JWT_KEY) {
      return {valid: true};
    }
    try {
      jwt.verify(params.token, this.JWT_KEY);
      return {valid: true};
    } catch {
      return {valid: false, code: 401, error: 'Invalid or expired token.'};
    }
  }

  addClient(topic, id) {
    if (typeof id !== 'string') id = '';
    if (id.length < 30) id += '-' + this.generateIdOfSize(30 - id.length);
    id += '.' + String(Date.now());
    const newClient = {id};
    this.list[topic].push(newClient);
    return newClient;
  }

  connectClient(topic, client, req, res) {
    res.writeHead(200, this.responseHeaders);
    client.res = res;
    console.log(`${client.id} connected to: ${topic}`);
    this.reportOnAllClients();
    req.on('close', () => {
      this.list[topic] = this.list[topic].filter(c => c.id !== client.id);
      console.log(`${client.id} disconnected from: ${topic}`);
      this.reportOnAllClients();
    });
  }

  reportOnAllClients() {
    let totalClients = 0;
    const topicsSummary = this.topics.map(topic => {
      totalClients += this.list[topic].length;
      return '(' + this.list[topic].length + ') ' + topic;
    });
    console.log(`${totalClients} total clients: ${topicsSummary.join(', ')}`);
  }

  generateIdOfSize(size) {
    const arr = [...Array(size)].map(() => {
      return (Math.floor(Math.random() * 36)).toString(36); // 0-9, then a-z
    });
    return arr.join('');
  }
}

module.exports = ClientsManager;