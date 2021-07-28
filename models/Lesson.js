'use strict';

const mongoose = require('mongoose');
// Import the slug package
const slug = require('mongoose-slug-generator');
// Initialize
mongoose.plugin(slug);

const lessonSchema = mongoose.Schema(
  {
    title: { type: String },
    // slug: { type: String },
    // course: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Course',
    // },
    image: String,
    video: String,
    description: String,
    content: String,
  },
  { timestamps: true },
);

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;