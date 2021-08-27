'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Level = mongoose.model('Level');

/**
 * GET /api/v1/level
 * Return list of levels
 */
router.get('/', async function (req, res, next) {
  try {
    const levels = await Level.find();
    if (!levels) {
      return res.status(404).json({ error: 'not found' });
    }
    const levelNames = [];
    levels.forEach((item) => {
      levelNames.push(item.name);
    });
    console.log(levelNames);
    res.json(levels);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
