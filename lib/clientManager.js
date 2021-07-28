class ClientManager {
  constructor() {
    this.list = {};
    this.topics = [];
  }

  createTopic(topic) {
    this.list[topic] = [];
    this.topics.push(topic);
  }

  connectClient(client, topic, res) {
    if (!this.list[topic]) this.createTopic(topic);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache');

    // res.writeHead(200, {
    //   'Content-Type': 'text/event-stream',
    //   'Connection': 'keep-alive',
    //   'Cache-Control': 'no-cache',
    // });

    client.res = res;
    this.list[topic].push(client);

    console.log(`${new Date()} ${client.id} connected to: ${topic}`);
  }

  disconnectClient(client, topic) {
    const idx = this.list[topic].indexOf(client);
    if (idx >= 0) {
      this.list[topic].splice(idx, 1);
      console.log(`${new Date()} ${client.id} disconnected from: ${topic}`);
    }
  }

  sendNewDataToAll(topic, newData) {
    if (!this.list[topic]) this.createTopic(topic);
    this.list[topic].forEach(client => client.res.write(newData));
  }

  pulseToAll() {
    this.topics.forEach(topic => this.sendNewDataToAll(topic, `:\n\n`));
  }

  reportOnAll() {
    let totalConnections = 0;

    const topicsSummary = this.topics.map(topic => {
        totalConnections += this.list[topic].length;
        return ('(' + this.list[topic].length + ') ' + topic)
      })

    console.log(`${totalConnections} total clients: ${topicsSummary.join(', ')}`);
  }
}

module.exports = ClientManager;