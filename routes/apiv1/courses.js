'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const Lesson = mongoose.model('Lesson');
const Course = mongoose.model('Course');
const User = mongoose.model('User');
const Favorite = mongoose.model('Favorite');
const jwtAuth = require('../../lib/jwAuth');

const multer = require('multer');
const { uploadFile } = require('../../lib/s3');
const path = require('path');

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'public/images/';

/**
 * Configurar multer
 */
const fileExtensionRemover = (originalName) => {
  return originalName.split('.')[0];
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_FOLDER);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      fileExtensionRemover(file.originalname) +
        '-' +
        Date.now() +
        path.extname(file.originalname),
    );
  },
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
    const price = req.query.price;
    const username = req.query.user;
    const categoryname = req.query.category;

    const user = await User.findOne({
      username: {
        $regex: `${username}`,
        $options: 'i',
      },
    });
    const category = await Category.findOne({
      name: {
        $regex: `${categoryname}`,
        $options: 'i',
      },
    });

    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;
    const sort = req.query.sort || { _id: -1 };

    // empty filter
    const filter = {};

    if (title) {
      filter.title = { $regex: `${title}`, $options: 'i' };
    }

    if (user) {
      filter.user = user._id;
    }

    if (category) {
      filter.category = category._id;
    }

    if (price) {
      let rango;

      if (price.indexOf('-') >= 0) {
        rango = price.split('-');
        if (rango[0] === '' && rango[1] !== '') {
          filter.price = { $lte: parseInt(rango[1]) };
        } else if (rango[0] !== '' && rango[1] === '') {
          filter.price = { $gte: parseInt(rango[0]) };
        } else if (rango[0] !== '' && rango[1] !== '') {
          filter.price = { $gte: parseInt(rango[0]), $lte: parseInt(rango[1]) };
        }
      } else {
        filter.price = price;
      }
    }

    const result = await Course.list(filter, skip, limit, sort);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/courses/:slug
 * Return detail of a course by it slug
 */
router.get('/:slug', async function (req, res, next) {
  try {
    const slug = req.params.slug;
    const course = await Course.findOne({ slug }).populate('lessons',)
    if (!course) {
      return res.status(404).json({ error: 'not found' });
    }
    const numFavs = await Favorite.find({
      'fav.course': course._id,
    }).countDocuments();
    const courseWithFavs = { ...course._doc, numFavs };
    res.json(courseWithFavs);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/courses/:slug/:lessonSlug
 * Return detail of a lesson by its slug
 */
 router.get('/:slug/:lessonSlug', async function (req, res, next) {
  try {
    const slug = req.params.slug;
    const lessonSlug = req.params.lessonSlug;
    const course = await Course.findOne({ slug }).populate('lessons');
    console.log(course.lessons)
    const lesson = course.lessons.find(lesson => lesson.slug === lessonSlug)
    console.log(lessonSlug)
    if (!course || !lesson) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(lesson);
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

      if (!formData.lessons) {
        // Save new course in database
        const newCourse = await course.save();
        res.status(201).json(newCourse);
      } else {
      // Save new lessons
        const lessonsToSave = JSON.parse(formData.lessons)
        course.lessons = []
        for (const key in lessonsToSave) {
          async function saveLesson() {
            const oneLessonToSave = new Lesson(lessonsToSave[key]);
            const saved = await oneLessonToSave.save()
            return saved
          }
          saveLesson().then(async saved => {
            console.log('LESSON salvada: ', saved)
            course.lessons.push(saved._id)
            console.log(course.lessons)
            // Save new course in database
            const newCourse = await course.save();
            res.status(201).json(newCourse);
          })
        }
      }

      
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
      const doc = await Course.findOne({ _id: formData._id });

      const validation =
        formData.title && formData.category && formData.user == doc.user;
      if (!validation) {
        res.status(400).json({ message: 'Something went wrong' });
        return;
      }

      doc.title = course.title;
      doc.description = course.description;
      doc.content = course.content;
      doc.category = course.category;
      if (req.file) doc.image = course.image;
      const result = await doc.save();
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

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
