'use strict';

const mongoose = require('mongoose');
// Import the slug package
const slug = require('mongoose-slug-updater');
// Initialize
mongoose.plugin(slug);

const courseSchema = mongoose.Schema(
  {
    title: { type: String, unique: true, index: true },
    slug: { type: String, slug: 'title', unique: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level',
    },
    price: { type: Number, required: true },
    video: String,
    description: String,
    content: String,
    requirements: String,
    whatYouWillLearn: String,
    image: String,
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
  },
  { timestamps: true },
);

courseSchema.statics.list = async function (filter, skip, limit, sort) {
  const query = Course.find(filter)
    .populate('user', 'username')
    .populate('category');
  query.sort({ _id: sort });
  query.skip(skip);
  query.limit(limit);

  return await query.exec();
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
