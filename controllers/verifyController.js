'use strict';

// eslint-disable-next-line no-unused-vars
const { User } = require('../models');

class verifyController {
  /**
   * GET /verify acount
   */
  async verify(req, res, next) {
    const verifyToken = req.query.vt;
    console.log('El token es: ' + verifyToken);
    try {
      const usuario = await User.findOne({ verifyToken });
      if (!usuario || Date.now() - usuario.verifyTokenTokenExpires > 3600000) {
        res
          .status(401)
          .json({ message: `The token provided is invalid or has expired` });
      } else {
        const result = await User.updateOne(
          { verifyToken },
          {
            activated: true,
            verifyToken: null,
            verifyTokenExpires: null,
          },
        );

        res.status(200).json({
          success: true,
          message: `email verified and account activated`,
        });
      }
    } catch (err) {
      //err.message = ''; TODO (adapt error message with cause)

      next(err);
    }
  }
}

module.exports = new verifyController();
