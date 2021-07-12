'use strict';

const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
});

const Favorite = mongoose.model('Favorite', categorySchema);

module.exports = Favorite;
