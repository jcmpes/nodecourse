require('dotenv').config();
const cors = require('cors')
const express = require('express')
const STRIPE_SECRET = process.env.STRIPE_SECRET
const stripe = require('stripe')(STRIPE_SECRET)
const { v4: uuid } = require('uuid');


app.post('/payment', (req, res) => {
  const {product, token} = req.body;
  console.log("PRODUCT: ", product);
  console.log("PRODUCT PRICE: ", product.price);
  const itempotencyKey = uuid()

  return stripe.customers.create({
    email: token.email,
    source: token.id
  }).then(customer => {
    stripe.charges.create({
      amount: product.price * 100,
      currency: 'usd',
      customer: customer.id,
      recipient_email: token.email,
      description: product.name,
      shipping: {
        name: token.card.name,
        address: {
          country: token.card.address_country
        }
      }
    }, {itempotencyKey})
  }).then(result => res.status(200).json(result))
  .catch(err => console.log(err))

})