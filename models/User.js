'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  username: { type: String, unique: true },
  resetPasswordToken: String,
  resetPasswordTokenExpires: Date,
  activated: Boolean,
  verifyToken: String,
  verifyTokenExpires: Date,
});

usuarioSchema.statics.hashPassword = function (plainPassword) {
  return bcrypt.hash(plainPassword, 7);
};

usuarioSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const Usuario = mongoose.model('User', usuarioSchema);

module.exports = Usuario;
