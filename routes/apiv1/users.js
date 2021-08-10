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

router.put('/edit', jwtAuth, async function (req, res, next) {
  try {
    const _id = req.apiAuthUserId;
    const formData = { ...req.body };
    console.log(formData);
    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(404).json({ error: 'not found' });
    }
    if (formData.username) user.username = formData.username;
    if (formData.email) user.email = formData.email;
    if (formData.password)
      user.password = await User.hashPassword(formData.password);
    const result = await user.save();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
