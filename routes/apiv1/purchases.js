'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Purchase = mongoose.model('Purchase');
const Course = mongoose.model('Course');
const jwtAuth = require('../../lib/jwAuth');
const sendEmail = require('../../lib/mailing');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET);

/**
 * Get /api/v1/purchases/user
 * Return all purchases for a specific user
 */
router.get('/user', jwtAuth, async function (req, res, next) {
  try {
    const userId = req.apiAuthUserId;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      res.status(404).json({ error: 'user not found' });
      return;
    }
    const purchases = await Purchase.find({ username: userId });
    if (purchases.length < 1) {
      res.json({ error: 'no purchases found for this user' });
      return;
    }
    res.json({ userPurchases: purchases });
  } catch (error) {
    next(error);
  }
});

/**
 * Get /api/v1/purchases/id
 * return one purchase by id
 */
router.get('/:purchaseId', jwtAuth, async function (req, res, next) {
  try {
    const purchaseId = req.params.purchaseId;
    const userId = req.apiAuthUserId;
    // TODO comprobar que el usuario es correcto
    const purchase = await Purchase.findOne({ _id: purchaseId });
    console.log('purchase', purchase);
    res.json({ purchase });
  } catch (error) {
    next(error);
  }
});

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

/**
 * POST /api/v1/purchases/create-payment-intent
 * Create a new purchase with pending status
 */
router.post('/create-payment-intent', jwtAuth, async function (req, res, next) {
  try {
    // Get items and user
    const userId = req.apiAuthUserId;
    const { items } = req.body;

    if (!userId) {
      res
        .status(401)
        .json({ message: 'User unauthorized or token has expired' });
    }

    if (!items) {
      res.status(400).json({ message: 'No courses to purchase' });
      return;
    }

    // Check user
    const user = await User.findOne({ _id: userId });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if any of the purchased courses have already been purchased
    let alreadyPurchased = false;
    items.forEach((course) => {
      if (user.courses.includes(course)) {
        alreadyPurchased = true;
      }
    });
    if (alreadyPurchased) {
      res
        .status(401)
        .json({ error: 'One of the courses is already purchased' });
      return;
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: await calculateOrderAmount(items),
      currency: 'eur',
    });

    // Save payment intent in DB
    const { amount, id, status } = paymentIntent;
    const newPurchase = new Purchase({
      username: mongoose.Types.ObjectId(userId),
      purchasedCourses: items,
      purchasePrice: amount,
      purchaseDate: new Date(),
      paymentCode: id,
      status: status,
    });
    await newPurchase.save();

    // Send response to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/purchases/webhook
 * Confirm new purchase is completed and successful
 */
router.post('/webhook', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'payment_intent.succeeded') {
    const singlePurchase = await Purchase.findOne({
      paymentCode: data.object.id,
    }).populate('username');

    // Update purchase status
    singlePurchase.status = data.object.status;
    const updatedPurchase = await singlePurchase.save();

    // add purchases courses to user purchase array
    const user = await User.findOneAndUpdate(
      { _id: singlePurchase.username._id },
      { $push: { courses: singlePurchase.purchasedCourses } },
    );

    // Send new email notifications to user and to teachers
    // of all courses purchased
    const mailObjCoustomer = {
      from: 'purchases@teachitup.com',
      subject: `Thank you, ${singlePurchase.username.username}`,
      recipients: [singlePurchase.username.email],
      message: `Your purchase has been completed. Enjoy your learning:<br>
      `,
    };
    for (let i = 0; i < singlePurchase.purchasedCourses.length; i++) {
      await Course.findOne({
        _id: singlePurchase.purchasedCourses[i],
      })
        .populate('user')
        .then(async (course) => {
          mailObjCoustomer.message += `<br>- ${course.title} - Instructor: ${course.user.email}`;

          await User.findOne({ _id: course.user })
            .then((userTeacher) => {
              const mailObjTeacher = {
                from: 'purchases@teachitup.com',
                subject: `Congratulations, ${userTeacher.username}`,
                recipients: [userTeacher.email],
                message: `One of your courses has been purchased:<br>
              ${course.title}
              ${singlePurchase.username.username} is your new alumn. ( ${user.email} )<br>Greetings.`,
              };
              sendEmail(mailObjTeacher);
            })
            .catch(console.log);
        })
        .catch(console.log);
    }
    sendEmail(mailObjCoustomer);

    res.sendStatus(200);
  }
});

/**
 * Get /api/v1/purchases/id
 * delete a purchase by id
 */
router.delete('/:purchaseId', jwtAuth, async function (req, res, next) {
  try {
    const userId = req.apiAuthUserId;
    const { purchaseId } = req.params;

    // delete purchase from DB
    const deletedPurchase = await Purchase.findOneAndRemove({
      _id: purchaseId,
    });
    if (!deletedPurchase) {
      res.status(404).json({ error: 'not found' });
      return;
    }

    // delete user purchased courses that match with deleted purchase
    const coursesToDelete = deletedPurchase.purchasedCourses;
    // get all user purchased courses and empty the array
    const userCourses = await User.findOneAndUpdate(
      { _id: userId },
      { courses: [] },
    );
    // filter valid courses
    const userValidCourses = userCourses.courses.filter(
      (course) => !coursesToDelete.includes(course),
    );
    // put valid courses in User array
    await User.findOneAndUpdate({ _id: userId }, { courses: userValidCourses });

    res.status(200).json({ deletedPurchase });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
