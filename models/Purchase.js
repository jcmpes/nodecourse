'use strict';

const mongoose = require('mongoose');

const purchaseSchema = mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  purchasedCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
  ],
  purchasePrice: Number,
  purchaseDate: Date,
  paymentCode: String,
  status: String,
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
