'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const User = mongoose.model('User');
const Favorite = mongoose.model('Favorite');
const jwtAuth = require('../../lib/jwAuth');
const fs = require('fs');
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
    fs.stat(UPLOAD_FOLDER, function (err, stats) {
      if (err) {
        return fs.mkdirSync(UPLOAD_FOLDER);
      } else {
        cb(null, UPLOAD_FOLDER);
      }
    });
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

router.get('/:username', async function (req, res, next) {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'not found' });
    }
    const courses = await Course.find({ user: user._id })
      .sort({ _id: -1 })
      .populate('user', 'username')
      .populate('category');
    res.json({ courses });
  } catch (err) {
    next(err);
  }
});

router.put('/edit', jwtAuth, upload.single('image'), async function (req, res, next) {
  try {
    const _id = req.apiAuthUserId;
    const formData = { ...req.body };
    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(404).json({ error: 'not found' });
    }
    if (formData.username) user.username = formData.username;
    if (formData.email) user.email = formData.email;
    if (formData.password)
      user.password = await User.hashPassword(formData.password);

    if (req.file) {
      // Uplaod file to S3 and add image location to course object
      const file = req.file;
      const { Location } = await uploadFile(file);
      user.avatar = Location;
    }
    const result = await user.save();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/delete-account', jwtAuth, async function (req, res, next) {
  try {
    const _id = req.apiAuthUserId;
    const { password } = req.body;
    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(404).json({ error: 'not found' });
    }

    if (await user.comparePassword(password)) {
      await User.findOneAndDelete({ _id }, function (err, result) {
        if (err) {
          res.status(500).json({ delete: 'fail' });
        } else {
          Course.deleteMany({ user: _id }).then(({ deletedCount }) => {
            console.log(
              `Deleted ${deletedCount} course${deletedCount !== 1 ? 's' : ''}`,
            );
          });
          Favorite.deleteMany({ fav: { user: _id } }).then(
            ({ deletedCount }) => {
              console.log(
                `Deleted ${deletedCount} favorite${
                  deletedCount !== 1 ? 's' : ''
                }`,
              );
            },
          );

          res.status(200).json({ deleted: result });
        }
      });
    } else {
      res.status(401).json({ delete: 'unauthorized' });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
