const jwt = require('jsonwebtoken');

class Registration {
  constructor(req) {
    this.topic = req.params.topic;
    this.id = req.params.id;
    if (req.params.token) {
      this.token = req.params.token;
      this.type = 'Bearer'
      this.header = true
    } else {
      this.header = req.header('Authorization');
      [this.type, this.token] = this.header ? this.header.split(' ') : ["", ""];
    }

    this.validParams = !!this.topic && !!this.id && !!this.header;
    this.validHeaders = !!this.type && (this.type === 'Bearer') && !!this.token;
  }

  isValid() {
    return (this.validParams && this.validHeaders);
  }

  verifyJWT(JWT_KEY) {
    jwt.verify(this.token, JWT_KEY);
  }
}

module.exports = Registration;