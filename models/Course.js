'use strict';

const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
  title: { type: String, unique: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  video: String,
  description: String,
  content: String,
  createdAt: Date,
});

courseSchema.statics.list = async function(limit, skip, sort) {
  const query = Course.find();
  query.limit(limit);
  query.skip(skip);
  query.sort(sort);

  return await query.exec();
}

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;