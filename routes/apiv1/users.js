'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const User = mongoose.model('User');
const jwtAuth = require('../../lib/jwAuth');

router.get('/:username', async function (req, res, next) {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'not found' });
    }
    const courses = await Course.find({ user: user._id })
      .sort({ _id: -1 })
      .populate('user')
      .populate('category');
    res.json({ courses });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
