'use strict';

const mongoose = require('mongoose');
// Import the slug package
const slug = require('mongoose-slug-generator');
// Initialize
mongoose.plugin(slug);

const lessonSchema = mongoose.Schema(
  {
    title: { type: String, unique: true, index: true },
    slug: { type: String, slug: 'title', unique: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    featuredImage: String,
    video: String,
    description: String,
    content: String,
  },
  { timestamps: true },
);

const lesson = mongoose.model('lesson', lessonSchema);

module.exports = lesson;