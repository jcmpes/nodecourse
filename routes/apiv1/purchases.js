'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Purchase = mongoose.model('Purchase');
const Course = mongoose.model('Course');
const jwtAuth = require('../../lib/jwAuth');

/**
 * Get /api/v1/purchases/id
 * return one purchase by id
 */
router.get('/:id', jwtAuth, async function (req, res, next) {
  try {
    const _id = req.params.id;
    const purchase = await Purchase.findOne({ _id });
    res.json({ purchase });
  } catch (error) {
    next(error);
  }
});

/**
 * Get /api/v1/purchases/user/username
 * Return all purchases for a specific user
 */
router.get('/user/:username', jwtAuth, async function (req, res, next) {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ error: 'user not found' });
      return;
    }
    const { _id } = user;
    const purchases = await Purchase.find({ user: _id });
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
 * Get /api/v1/purchases
 * create a new purchase
 */
router.post('/', jwtAuth, async function (req, res, next) {
  try {
    // Server side validation
    const purchaseData = req.body;
    const userId = req.apiAuthUserId;
    const purchasedCourses =
      typeof purchaseData.purchasedCourses === 'string'
        ? [purchaseData.purchasedCourses]
        : purchaseData.purchasedCourses;

    const validation = purchasedCourses && purchaseData.paymentCode;
    if (!validation) {
      res.status(400).json({ message: 'all purchase data is required' });
      return;
    }

    // check user
    const user = await User.findOne({ _id: userId });
    if (!user) {
      res.status(404).json({ error: 'user not found' });
      return;
    }

    // check if any of the purchased courses have already been purchased
    let alreadyPurchased = false;
    purchasedCourses.forEach((course) => {
      if (user.courses.includes(course)) {
        alreadyPurchased = true;
      }
    });
    if (alreadyPurchased) {
      res.status(401).json({ error: 'course already purchased' });
      return;
    }

    // add purchases courses to user purchase array
    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { courses: purchasedCourses } },
    );

    // check price courses in DB in order to add total price to purchaseData
    let totalCoursesPrice = 0;
    for (let i = 0; i < purchasedCourses.length; i++) {
      const courseId = purchasedCourses[i];
      const course = await Course.findOne({ _id: courseId });
      if (course.price) {
        totalCoursesPrice += course.price;
      }
    }
    purchaseData.purchasePrice = totalCoursesPrice;

    purchaseData.username = userId;
    purchaseData.purchaseDate = Date.now();

    const purchase = new Purchase(purchaseData);
    console.log('purchase -->', purchase);
    const newPurchase = await purchase.save();
    console.log('newPurchase -->', newPurchase);
    res.status(201).json({ newPurchaseCreated: newPurchase });
  } catch (error) {
    next(error);
  }
});

/**
 * Get /api/v1/purchases/id
 * delete a purchase by id
 */
router.delete('/:purchaseId', jwtAuth, async function (req, res, next) {
  try {
    const { purchaseId } = req.params;
    const deletedPurchase = await Purchase.findOneAndRemove({
      _id: purchaseId,
    });
    res.status(200).json({ deletedPurchase });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
