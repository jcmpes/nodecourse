'use strict';

// eslint-disable-next-line no-unused-vars
const { User } = require('../models');
const generator = require('generate-api-key');

class verifyController {
  /**
   * POST /verify acount
   */
  async verify(req, res, next) {
    try {
      const { verifyToken } = req.body;

      const usuario = await User.findOne({ verifyToken });
      if (!usuario || Date.now() - usuario.verifyTokenTokenExpires > 3600000) {
        res.json({ message: `The token provided is invalid or has expired` });
      } else {
        const result = await User.updateOne(
          { verifyToken },
          {
            activated: true,
            verifyToken: null,
            verifyTokenExpires: null,
          }
        );

        res.json({
          success: true,
          message: `eMail verified and account activated`,
        });
      }
    } catch (err) {
      //err.message = ''; TODO (adapt error message with cause)

      next(err);
    }
  }
}

module.exports = new verifyController();
