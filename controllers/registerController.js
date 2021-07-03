'use strict';

const sendEmail = require('../lib/mailing');
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
      const mailObj = {
        from: 'confirm@nodecourse.com',
        subject: `Welcome, ${username}`,
        recipients: ['usuario616@gmail.com'], // <--- For Development (change to desired recepter)
        // recipients: [email], // <--------------------- For Production
        message: `Welcome, ${username}<br>Please, confirm your email account.`,
      };
      //TODO: Make it a verification mail
      sendEmail(mailObj);

      res.json({ success: true, message: `user created` });
    } catch (err) {
      //err.message = ''; TODO (adapt error message with cause)

      next(err);
    }
  }
}

module.exports = new RegisterController();
