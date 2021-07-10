'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Course = mongoose.model('Course');

// Return the list of courses
router.get('/', async function(req, res, next) {
  try {
    const limit = parseInt(req.query.start) || 100;
    const skip = parseInt(req.query.skip) || 0;
    const sort = req.query.sort || 'createdAt';
  
    const result = await Course.list(limit, skip, sort);
    res.json(result);
  } catch (error) {
    next(err)
  }
});

module.exports = router;