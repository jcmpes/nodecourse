'use strict';

const mongoose = require('mongoose');

const favoriteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
