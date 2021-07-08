'use strict';

const mongoose = require('mongoose');

const CursoSchema = mongoose.Schema({
  title: { type: String, unique: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario"
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria"
  },
  video: String,
  description: String,
  content: String,
  createdAt: Date,

});

module.exports = mongoose.model("Curso", CursoSchema);