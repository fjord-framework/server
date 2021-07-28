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

  clientNotConnected() {
    this.res.status(400)
      .send({ code: 400,
              status: "Client failed to connect."
            });
  }

  clientConnected() {
    this.res.status(200)
      .send({ code: 200,
              status: "Client connected."
            });
  }

}

module.exports = NotificationHandler;