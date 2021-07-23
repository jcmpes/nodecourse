'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Purchase = mongoose.model('Purchase');

/**
 * Get /api/v1/purchases
 * return all purchases
 */
router.get('/', async function (req, res, next) {
  try {
    const purchases = await Purchase.find();
    if (!purchases) {
      return res.status(404).json({ error: 'not found' });
    }
    res.status().json({ purchaseList: purchases });
  } catch (error) {
    next(error);
  }
});

/**
 * Get /api/v1/purchases/id
 * return one purchase by id
 */
router.get('/:id', async function (req, res, next) {
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
router.get('/user/:username', async function (req, res, next) {
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
router.post('/', async function (req, res, next) {
  try {
    // Server side validation
    const purchaseData = req.body;
    const validation =
      purchaseData.username &&
      purchaseData.purchasedCourses &&
      purchaseData.purchasePrice &&
      purchaseData.purchaseDate &&
      purchaseData.paymentCode;
    if (!validation) {
      res.status(400).json({ message: 'All purchase data is required' });
      return;
    }

    // // Verify identity of publisher
    // if (purchaseData.user != req.apiAuthUserId) {
    //   console.log(formData.user, req.apiAuthUserId) //
    //   return res.status(401).json({ message: 'Unauthorized' });
    // };

    // Inject userId into the new purchase before saving it
    const userData = await User.findOne({ username: purchaseData.username });
    purchaseData.username = userData._id;

    const purchase = new Purchase(purchaseData);
    const newPurchase = await purchase.save();
    res.status(201).json({ newPurchaseCreated: newPurchase });
  } catch (error) {
    next(error);
  }
});

/**
 * Get /api/v1/purchases/id
 * delete a purchase by id
 */
router.delete('/:purchaseId', async function (req, res, next) {
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
