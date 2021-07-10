'use strict';

const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: String,
  description: String,
  slug: String,
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  }]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
