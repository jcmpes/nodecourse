'use strict';

const sendEmail = require('../lib/mailing');
// eslint-disable-next-line no-unused-vars
const { User } = require('../models');
const generator = require('generate-api-key');

class ForgotPasswordController {
  /**
   * POST /Forgot password: request reset link
   */
  async forgot(req, res, next) {
    try {
      const { email } = req.body;

      const usuario = await User.findOne({ email });

      if (!usuario) {
        res.json({
          // original message: 'There is not such email in database'
          message: `You will receive an email if this email address is in our database`,
        });
      } else {
        const randomToken = generator();
        const result = await User.updateOne(
          { email },
          {
            resetPasswordToken: randomToken,
            resetPasswordTokenExpires: Date.now() + 3600000,
          },
        );
        const address = `${process.env.FRONTEND_URL}/reset-password/${randomToken}`;
        const mailObj = {
          from: 'forgot-password@nodecourse.com',
          subject: `Reset password`,
          // recipients: ['oscar.corb@gmail.com'], // <--- For Development (change to desired recepter)
          recipients: [email], // <--------------------- For Production
          message: `Here is your password reset link: <a href='${address}'>${address}</a>`,
        };
        //TODO: Make it a verification mail
        sendEmail(mailObj);
        res.json({
          // success: true,
          // Original message: 'Reset link sent to user'
          message: `You will receive an email if this email address is in our database`,
        });
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ForgotPasswordController();
