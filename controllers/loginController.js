'use strict';

const jwt = require('jsonwebtoken');
const { User, Favorite } = require('../models');

class LoginController {
  /**
   * POST /loginJWT
   */
  async postJWT(req, res, next) {
    try {
      const { email, password } = req.body;

      const usuario = await User.findOne({ email });
      const favorites = await Favorite.find({ user: usuario });
      const favs = favorites.map((fav) => fav.course);

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
          res.json({
            token: jwtToken,
            displayName: usuario.username,
            favs,
          });
        },
      );
    } catch (err) {
      next(err);
    }
  }
  /**
   * POST /loginJWT with token
   */
  async loginWithToken(req, res, next) {
    try {
      const { token } = req.body;

      jwt.verify(token, process.env.JWT_SECRET, async (err, jwtToken) => {
        if (err) {
          next(err);
          return;
        }
        const usuario = await User.findOne({ _id: jwtToken._id });
        const favorites = await Favorite.find({ user: jwtToken._id });
        const favs = favorites.map((fav) => fav.course);

        res.json({
          loggedWithToken: true,
          displayName: usuario.username,
          userID: jwtToken._id,
          favs,
        });
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LoginController();
