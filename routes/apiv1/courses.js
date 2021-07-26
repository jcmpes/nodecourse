'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const Course = mongoose.model('Course');
const User = mongoose.model('User');
const jwtAuth = require('../../lib/jwAuth');

const multer = require('multer');
const { uploadFile } = require('../../lib/s3');
const path = require('path');

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || "public/images/";

/**
 * Configurar multer
 */
const fileExtensionRemover = originalName => {
  return originalName.split('.')[0];
};

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, UPLOAD_FOLDER);
  },
  filename: function(req,file, cb) {
    cb(null, fileExtensionRemover(file.originalname) + '-' + Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage });

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
router.post(
  '/',
  jwtAuth,
  upload.single('image'),
  async function (req, res, next) {
    try {
      // Server side validation
      const formData = { ...req.body };
      const validation = formData.title && formData.category;
      if (!validation) {
        res
          .status(400)
          .json({ message: 'Title and category are both required' });
        return;
      }

      // Inject userId in new course before saving it
      formData.user = req.apiAuthUserId;
      const course = new Course(formData);

      if (req.file) {
        // Uplaod file to S3 and add image location to course object
        const file = req.file;
        const { Location } = await uploadFile(file);        
        course.image = Location;
      }    

      // Save new course in database
      const newCourse = await course.save();
      res.status(201).json(newCourse);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PUT /api/v1/courses
 * Updates an existing course
 */
router.put(
  '/',
  jwtAuth,
  upload.single('image'),
  async function (req, res, next) {
    try {
      const formData = { ...req.body };
      // const validation = formData.title && formData.category;
      // if (!validation) {
      //   res
      //     .status(400)
      //     .json({ message: 'Title and category are both required' });
      //   return;
      // }

      // Inject userId in new course before saving it
      formData.user = req.apiAuthUserId;
      const course = new Course(formData);

      if (req.file) {
        // Uplaod file to S3 and add image location to course object
        const file = req.file;
        const { Location } = await uploadFile(file);        
        course.image = Location;
      }    

      // Find course to be updated and save changes
      const doc = await Course.findOne({ _id: formData._id })

      const validation = formData.title && formData.category && formData.user == doc.user;
      if (!validation) {
        res
          .status(400)
          .json({ message: 'Somethign went wrong' });
        return;
      }

      doc.title = course.title;
      doc.description = course.description;
      doc.content = course.content;
      doc.category = course.category;
      if(req.file) doc.image = course.image;
      const result = await doc.save()
      res.status(201).json(result)
      
    } catch(err) {
      next(err)
    }
  }
)


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
