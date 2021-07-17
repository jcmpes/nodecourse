'use strict';

const mongoose = require('mongoose');

const purchaseSchema = mongoose.Schema({
  price: Number,
  date: Date,
  paymentCode: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
  ],
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
