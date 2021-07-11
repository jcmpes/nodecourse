'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Course = mongoose.model('Course');

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
    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;
    const sort = req.query.sort || 'createdAt';

    const result = await Course.list(skip, limit, sort);
    res.json(result);
  } catch (error) {
    next(err);
  }
});

/**
 * GET /api/v1/courses/:id
 * Return detail of a course
 */
router.get('/:id', async function (req, res, next) {
  try {
    const _id = req.params.id;
    const course = await Course.findOne({ _id });
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
router.post('/', async function (req, res, next) {
  try {
    const courseData = req.body;
    const course = new Course(courseData);
    const newCourse = await course.save();
    res.status(201).json({ result: newCourse });
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
    await Course.deleteOne({ _id });
    res.json();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
