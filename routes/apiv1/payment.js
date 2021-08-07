require('dotenv').config();
const cors = require('cors')
const express = require('express')
const router = express.Router();
const STRIPE_SECRET = process.env.STRIPE_SECRET
const stripe = require('stripe')(STRIPE_SECRET)
const { v4: uuid } = require('uuid');


router.post('/', (req, res) => {
  const {course, token} = req.body;
  console.log("PRODUCT: ", course);
  console.log("PRODUCT PRICE: ", course.price);
  const itempotencyKey = uuid()

  return stripe.customers.create({
    email: token.email,
    source: token.id
  }).then(customer => {
    stripe.charges.create({
      amount: course.price * 100,
      currency: 'usd',
      customer: customer.id,
      recipient_email: token.email,
      description: course.title,
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

module.exports = router;