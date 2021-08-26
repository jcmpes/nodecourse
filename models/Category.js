'use strict';

const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: String,
  description: String,
  slug: String,
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
