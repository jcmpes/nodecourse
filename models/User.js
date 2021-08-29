'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
  email: { type: String, unique: true, index: true },
  password: String,
  username: { type: String, unique: true, index: true },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
  ],
  resetPasswordToken: String,
  resetPasswordTokenExpires: Date,
  activated: Boolean,
  verifyToken: String,
  verifyTokenExpires: Date,
  avatar: String
});

userSchema.statics.hashPassword = function (plainPassword) {
  return bcrypt.hash(plainPassword, 7);
};

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
