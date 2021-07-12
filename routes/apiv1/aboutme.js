'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwtAuth = require('../../lib/jwAuth');

// const Course = mongoose.model('Course');
const User = mongoose.model('User');
const Favorite = mongoose.model('Favorite');

/**
 * Receives a course id and returns wether
 * it's favorited by the user or not
 *
 * /api/v1/aboutme/isfav?course=60eaf69703f0a106fc605627
 */
router.get('/isfav/:course', jwtAuth, async function (req, res, next) {
  try {
    const user = req.apiAuthUserId;
    const course = req.params.course;
    const isFav = await Favorite.find({ user, course });
    res.json({ result: isFav.length > 0 });
  } catch (err) {
    next(err);
  }
});

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

module.exports = router;
