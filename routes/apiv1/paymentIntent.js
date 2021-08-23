'use strict';

const express = require('express');
const Course = require('../../models/Course');
const router = express.Router();
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET);

async function calculateOrderAmount(items) {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  try {
    let total = 0;
    for await (let item of items) {
      const course = await Course.findOne({ _id: item });
      total = total + course.price;
    }
    return total * 100;
  } catch (err) {
    console.log(err);
  }
}

router.post('/create-payment-intent', async (req, res) => {
  const { items } = req.body;
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: await calculateOrderAmount(items),
    currency: 'eur',
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

module.exports = router;
