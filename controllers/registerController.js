'use strict';

// eslint-disable-next-line no-unused-vars
const { User } = require('../models');

class RegisterController {
  /**
   * POST /Register
   */
  async register(req, res, next) {
    try {
      const { email, password, username } = req.body;

      const result = await User.insertMany([
        {
          email,
          password: await User.hashPassword(password),
          username,
        },
      ]);

      res.json({ success: `user created` });
    } catch (err) {
      //err.message = ''; TODO (adapt error message with cause)

      next(err);
    }
  }
}

module.exports = new RegisterController();
