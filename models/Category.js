'use strict';

const mongoose = require('mongoose');

const usuarioSchema = mongoose.Schema({
  name: String,
  description: String,
  slug: String,
  courses: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Curso"
  }
});

const Usuario = mongoose.model('User', usuarioSchema);

module.exports = Usuario;
