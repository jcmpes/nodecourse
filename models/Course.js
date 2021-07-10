'use strict';

const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
  title: { type: String, unique: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  featuredImage: String,
  video: String,
  description: String,
  content: String,
  createdAt: Date,
});

courseSchema.statics.list = async function (skip, limit, sort) {
  const query = Course.find().populate('user').populate('category');
  query.sort(sort);
  query.skip(skip);
  query.limit(limit);

  return await query.exec();
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
