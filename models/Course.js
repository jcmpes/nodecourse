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
    price: { type: Number, required: true },
    video: String,
    description: String,
    content: String,
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
  const query = Course.find(filter).populate('user').populate('category');
  query.sort(sort);
  query.skip(skip);
  query.limit(limit);

  return await query.exec();
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
