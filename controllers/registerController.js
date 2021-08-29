'use strict';

const generator = require('generate-api-key');

const sendEmail = require('../lib/mailing');
// eslint-disable-next-line no-unused-vars
const { User } = require('../models');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const { uploadFile } = require('../lib/s3');
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

/**
 * POST /Register
 */
router.post("/", upload.single('image'), async function(req, res, next) {
  try {
    const { email, password, username } = req.body;
    const verifyToken = generator({ method: 'bytes', length: 24 });
    let avatar = null;
    if (req.file) {
      // Uplaod file to S3 and add image location to course object
      const file = req.file;
      const { Location } = await uploadFile(file);
      avatar = Location;
    }
    const result = await User.insertMany([
      {
        email,
        password: await User.hashPassword(password),
        username,
        activated: false,
        verifyToken,
        verifyTokenExpires: Date.now() + 3600000,
        avatar
      },
    ]);
    const address = `${process.env.FRONTEND_URL}/verify/${verifyToken}`;
    const mailObj = {
      from: 'confirm@nodecourse.com',
      subject: `Welcome, ${username}`,
      // recipients: ['oscar.corb@gmail.com'], // <--- For Development (change to desired recepter)
      recipients: [email], // <--------------------- For Production
      message: `Welcome, ${username}<br>Please, confirm your email account following this link:<br>
      <a href='${process.env.FRONTEND_URL}/verify/${verifyToken}'>${process.env.FRONTEND_URL}/verify/${verifyToken}</a>`,
    };
    //TODO: Make it a verification mail
    sendEmail(mailObj);

    res.json({
      success: true,
      message: `An email has been sent to you. Please, follow the link provided to confirm your email account.`,
    });
  } catch (err) {
    if (
      err.message.indexOf('E11000') != -1 &&
      err.message.indexOf('email') != -1
    ) {
      err.message = 'email already registered';
    } else if (
      err.message.indexOf('E11000') != -1 &&
      err.message.indexOf('username') != -1
    ) {
      err.message = 'username already taken';
    }

    next(err);
  }
})

module.exports = router;
