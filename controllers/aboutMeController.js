'use strict';
var express = require('express');
var router = express.Router();
const { User } = require('../models');
const jwtAuth = require('../lib/jwAuth');

router.get('/', jwtAuth, async function (req, res, next) {
  try {
    const _id = req.apiAuthUserId;
    const result = await User.findOne({ _id });
    res.json({ username: result.username });
  } catch (err) {
    next(err);
  }
});
module.exports = router
