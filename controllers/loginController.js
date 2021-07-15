'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');

class LoginController {
  /**
   * POST /loginJWT
   */
  async postJWT(req, res, next) {
    try {
      const { email, password } = req.body;

      const usuario = await User.findOne({ email });

      if (
        !usuario ||
        !usuario.activated ||
        !(await usuario.comparePassword(password))
      ) {
        const error = new Error(
          'invalid credentials or email account not verified',
        );
        error.status = 401;
        next(error);
        return;
      }

      jwt.sign(
        { _id: usuario._id },
        process.env.JWT_SECRET,
        { expiresIn: '2h' },
        (err, jwtToken) => {
          if (err) {
            next(err);
            return;
          }

          res.json({ token: jwtToken, displayName: usuario.username });
        },
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LoginController();
