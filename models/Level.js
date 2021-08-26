'use strict';

const mongoose = require('mongoose');

const levelSchema = mongoose.Schema({
  name: String,
});

const Level = mongoose.model('Level', levelSchema);

module.exports = Level;
