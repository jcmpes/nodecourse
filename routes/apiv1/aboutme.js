'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwtAuth = require('../../lib/jwAuth');

const Course = mongoose.model('Course');
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
 * Receives a course id and returns wether
 * it's favorited by the user or not
 *
 * /api/v1/aboutme/isfav?course=60eaf69703f0a106fc605627
 */
router.get('/myfavs', jwtAuth, async function (req, res, next) {
  try {
    const user = req.apiAuthUserId;
    const isFav = await Favorite.find({ user });
    const favs = isFav.map((fav) => fav.course);

    res.json({ favs });
  } catch (err) {
    next(err);
  }
});

router.get('/myfavsdetails', jwtAuth, async function (req, res, next) {
  try {
    const user = req.apiAuthUserId;
    const favorites = await Favorite.find({ user });
    const favs = [];
    for (let i = 0; i < favorites.length; i++) {
      const course = await Course.findOne({ _id: favorites[i].course })
        .populate('user')
        .populate('category');
      favs.push(course);
    }
    res.json({ courses: favs });
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
router.post('/newfav/:course', jwtAuth, async function (req, res, next) {
  try {
    const user = req.apiAuthUserId;
    const course = req.params.course;
    const favorite = await Favorite.insertMany([{ user, course }]);
    res.json({ success: true, favorite });
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
router.post('/removefav/:course', jwtAuth, async function (req, res, next) {
  try {
    const user = req.apiAuthUserId;
    const course = req.params.course;
    const favorite = await Favorite.findOne({ user, course });
    console.log(favorite);
    const { deletedCount } = await Favorite.deleteOne({ _id: favorite._id });
    res.json({ success: deletedCount > 0 });
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
