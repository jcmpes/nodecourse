'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const Course = mongoose.model('Course');
const User = mongoose.model('User');
const jwtAuth = require('../../lib/jwAuth');

const multer  = require('multer');
const { uploadFile } = require('../../lib/s3');
const upload = multer({ dest: "public/images/"});


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
router.post('/', jwtAuth, upload.single('image'), async function (req, res, next) {
  try {
    // Server side validation
    const formData = { ...req.body }
    const validation = formData.title && formData.category && formData.user
    if (!validation) {
      res.status(400).json({ message: 'Title and category are both required' });
      return;
    };
    
    // Inject userId in new course before saving it
    const publisher = await User.findOne({ username: formData.user });
    formData.user = publisher._id;
    
    // Verify identity of publisher
    if (formData.user != req.apiAuthUserId) {
      console.log(formData.user, req.apiAuthUserId)
      return res.status(401).json({ message: 'Unauthorized' });
    };
    
    // Uplaod file to S3
    const file = req.file;
    const { Location } = await uploadFile(file)
    console.log('Response from S3: ', response)
    
    // Save image name
    const course = new Course(formData);
    course.image = Location;

    // Save new course in database
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
