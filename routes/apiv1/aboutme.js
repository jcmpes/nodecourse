'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwtAuth = require('../../lib/jwAuth');

// const Course = mongoose.model('Course');
const User = mongoose.model('User');
const Favorite = mongoose.model('Favorite');

/**

 */
router.get('/', jwtAuth, async function (req, res, next) {
  try {
    const _id = req.apiAuthUserId;
    const result = await User.findOne({ _id });
    res.json({ username: result.username });
  } catch (err) {
    next(err);
  }
});

/**
 * Receives a course id and returns wether
 * it's favorited by the user or not
 *
 * /api/v1/aboutme/isfav?course=60eaf69703f0a106fc605627
 */
router.get('/isfav', jwtAuth, async function (req, res, next) {
  try {
    const user = req.apiAuthUserId;
    const { course } = req.body;
    const isFav = await Favorite.findOne({ user, course });
    if (!isFav) {
      return res.json({ return: false });
    }
    res.json({ result: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
