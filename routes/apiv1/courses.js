'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const Course = mongoose.model('Course');
const User = mongoose.model('User');
const jwtAuth = require('../../lib/jwAuth');


/**
 * GET /api/v1/courses
 * Return list of courses
 *
 * Sort descending by title
 * GET /api/v1/courses?sort=-title
 *
 * Limit results for pagination
 * GET /api/v1/courses?skip=10&limit=10
 */
router.get('/', async function (req, res, next) {
  try {
    const title = req.query.title;

    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;
    const sort = req.query.sort || 'createdAt';

    // empty filter
    const filter = {};

    if (title) {
      filter.title = new RegExp('^' + title);
    }

    const result = await Course.list(filter, skip, limit, sort);
    res.json(result);
  } catch (error) {
    next(err);
  }
});

/**
 * GET /api/v1/courses/:slug
 * Return detail of a course by it slug
 */
router.get('/:slug', async function (req, res, next) {
  try {
    const slug = req.params.slug;
    const course = await Course.findOne({ slug });
    if (!course) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/courses
 * Create a new course
 */
router.post('/', jwtAuth, async function (req, res, next) {
  try {
    // Server side validation
    if (!courseData.category || !courseData.user) {
      res.status(400).json({ message: 'User and category are both required' });
      return;
    };

    // Inject userId in new course before saving it
    const courseData = req.body;
    const { user } = courseData;
    const publisher = await User.findOne({ username: user })
    courseData.user = publisher._id;

    // Verify identity of publisher
    if (courseData.user !== req.apiAuthUserId) {
      res.status(401).json({ message: 'Unauthorized' });
    };

    const course = new Course(courseData);
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/courses/:id
 * Delete an existing course
 */
router.delete('/:id', async function (req, res, next) {
  try {
    const _id = req.params.id;
    const deleted = await Course.deleteOne({ _id });
    res.status(200).json({ deleted });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
