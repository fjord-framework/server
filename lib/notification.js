class NotificationHandler {
  constructor(res) {
    this.res = res;
  }

  invalidTopic() {
    this.res.status(401)
      .send({ code: 401,
              status: 'Invalid topic'
            });
  }

  invalidToken() {
    this.res.status(403)
      .send({ code: 403,
              status: 'Invalid or expired token.'
            });
  }
}

module.exports = NotificationHandler;