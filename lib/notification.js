class NotificationHandler {
  constructor(res) {
    this.res = res;
  }

  invalidParams() {
    this.res.status(400)
      .send({ code: 400,
              status: 'Missing some registration parameters'
            });
  }

  invalidHeaders() {
    this.res.status(401)
      .send({ code: 401,
              status: 'Invalid JWT header authentication syntax'
            });
  }

  invalidToken() {
    this.res.status(403)
      .send({ code: 403,
              status: 'Invalid or expired token.'
            });
  }

  clientNotRegistered() {
    this.res.status(400)
      .send({ code: 400,
              status: "Client must first register and pass JWT authentication"
            });
  }

  clientRegistered() {
    this.res.status(200)
      .send({ code: 200,
              status: "Client registered"
            });
  }

}

module.exports = NotificationHandler;