'use strict';

const mongoose = require('mongoose');
//
const favoriteSchema = mongoose.Schema({
  fav: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    },
  },
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
