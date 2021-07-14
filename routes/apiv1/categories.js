'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = mongoose.model('Category');

/**
 * GET /api/v1/categories
 * Return list of categories
 */
router.get('/', async function(req, res, next) {
  try {
    const categories = await Category.find();
    if(!categories) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(categories)
  } catch(err) {
    next(err);
  }
})

module.exports = router;