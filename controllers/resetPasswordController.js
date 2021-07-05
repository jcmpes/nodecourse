'use strict';

// eslint-disable-next-line no-unused-vars
const { User } = require('../models');
const generator = require('generate-api-key');

class ResetPasswordController {
  /**
   * POST /Reset password
   */
  async reset(req, res, next) {
    try {
      const { resetToken, newPassword } = req.body;

      const usuario = await User.findOne({ resetPasswordToken: resetToken });
      if (
        !usuario ||
        Date.now() - usuario.resetPasswordTokenExpires > 3600000
      ) {
        res.json({ message: `The token provided is invalid or has expired` });
      } else {
        const newPasswordHashed = await User.hashPassword(newPassword);
        const result = await User.updateOne(
          { resetPasswordToken: resetToken },
          {
            password: newPasswordHashed,
            resetPasswordToken: undefined,
            resetPasswordTokenExpires: undefined,
          }
        );

        res.json({ success: true, message: `Password updated` });
      }
    } catch (err) {
      //err.message = ''; TODO (adapt error message with cause)

      next(err);
    }
  }
}

module.exports = new ResetPasswordController();
