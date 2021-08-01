'use strict';

const mongoose = require('mongoose');
// Import the slug package
const slug = require('mongoose-slug-updater');
// Initialize
mongoose.plugin(slug);

const lessonSchema = mongoose.Schema(
  {
    title: { type: String },
    slug: { type: String, slug: 'title', unique: true },
    video: String,
    description: String,
    content: String,
  },
  { timestamps: true },
);

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
