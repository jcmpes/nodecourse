'use strict';
require('dotenv').config();

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const jwtToken =
    req.get('Authorization') || req.query.token || req.body.token;

  if (!jwtToken) {
    const error = new Error('no token provided');
    error.status = 401;
    next(error);
    return;
  }

  jwt.verify(jwtToken, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      err.status = 401;
      next(err);
      return;
    }
    req.apiAuthUserId = payload._id;
    next();
  });
};
