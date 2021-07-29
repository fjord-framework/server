const redis = require('redis');

class Publisher {
  constructor(REDIS_PORT, REDIS_HOST, SEC_PER_PULSE, clientsList) {
    this.redis = redis.createClient(REDIS_PORT, REDIS_HOST);
    this.subscribe(REDIS_PORT);
    this.list = clientsList;
    this.topics = Object.getOwnPropertyNames(clientsList);
    this.initializeHeartbeat(SEC_PER_PULSE);
  }

  subscribe(port) {
    this.redis.on('connect', () => {
      this.redis.subscribe('redis'); // subscribe to redis topic (1 topic only)
      console.log(`connected to redis on port ${port}`);
    });
  }

  listenAndPublish(){
    this.redis.on('message', (channel, message) => {
      const data = JSON.parse(message);
      this.publish(data.topic, message);
      if (data.topic !== 'all') this.publish('all', message);
    });
  }

  initializeHeartbeat(SEC_PER_PULSE) {
    let pulseRate = parseInt(SEC_PER_PULSE, 10) * 1000;
    if (Number.isNaN(pulseRate) || pulseRate < 10000) pulseRate = 25000;
    // sending a repeating heartbeat is necessary to regularly check on health of all connections
    setInterval(this.heartbeat.bind(this), pulseRate);
  }

  heartbeat() {
    this.topics.forEach(topic => {
      this.list[topic].forEach(client => client.res.write(`:\n\n`));
    })
  }

  publish(topic, record) {
    this.list[topic].forEach(client => client.res.write(`data: ${record}\n\n`));
  }
}

module.exports = Publisher;