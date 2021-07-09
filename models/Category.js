'use strict';

const mongoose = require('mongoose');

const categoriaSchema = mongoose.Schema({
  name: String,
  description: String,
  slug: String,
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Curso"
  }]
});

const Categoria = mongoose.model('Category', categoriaSchema);

module.exports = Categoria;
