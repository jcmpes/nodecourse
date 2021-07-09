'use strict';

const generator = require('generate-api-key');

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
      const verifyToken = generator({ method: 'bytes' });
      const result = await User.insertMany([
        {
          email,
          password: await User.hashPassword(password),
          username,
          activated: false,
          verifyToken,
          verifyTokenExpires: Date.now() + 3600000,
        },
      ]);
      const address = `${process.env.FRONTEND_URL}/verify/${verifyToken}`;
      const mailObj = {
        from: 'confirm@nodecourse.com',
        subject: `Welcome, ${username}`,
        // recipients: ['oscar.corb@gmail.com'], // <--- For Development (change to desired recepter)
        recipients: [email], // <--------------------- For Production
        message: `Welcome, ${username}<br>Please, confirm your email account following this link:<br>
        <a href=${address}>${address}</a>`,
      };
      //TODO: Make it a verification mail
      sendEmail(mailObj);

      res.json({
        success: true,
        message: `A mail has been sent to you. Please, follow the link provided to confirm your email account.`,
      });
    } catch (err) {
      //err.message = ''; TODO (adapt error message with cause)

      next(err);
    }
  }
}

module.exports = new RegisterController();
