const jwt = require('jsonwebtoken');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

class Registration {
  constructor(topic, id, token) {
    this.topic = topic;
    this.id = (typeof id !== 'string') ?
      ('' + String(Date.now())) :
      (id + String(Date.now()));
    this.token = token;
  }

  hasValidTopic() {
    const { VALID_TOPICS } = process.env;
    return VALID_TOPICS.split(' ').includes(this.topic) || this.topic === 'all';
  }

  verifyJWT(JWT_KEY) {
    jwt.verify(this.token, JWT_KEY);
  }
}

module.exports = Registration;
