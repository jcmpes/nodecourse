'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Purchase = mongoose.model('Purchase');
const Course = mongoose.model('Course');
const jwtAuth = require('../../lib/jwAuth');
const sendEmail = require('../../lib/mailing');

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
    console.log(purchasedCourses);
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
    const newPurchase = await purchase.save();

    const mailObjCoustomer = {
      from: 'purchases@nodecourse.com',
      subject: `Thank you, ${user.username}`,
      recipients: [user.email],
      message: `Your purchase has been completed. Enjoy your learning:<br>
      `,
    };

    for (let i = 0; i < newPurchase.purchasedCourses.length; i++) {
      await Course.findOne({
        _id: newPurchase.purchasedCourses[i],
      })
        .then(async (course) => {
          mailObjCoustomer.message += `<br>- ${course.title}`;

          await User.findOne({ _id: course.user })
            .then((userTeacher) => {
              const mailObjTeacher = {
                from: 'purchases@nodecourse.com',
                subject: `Congratulations, ${userTeacher.username}`,
                recipients: [userTeacher.email],
                message: `One of your courses has been purchased:<br>
              ${course.title}
              ${user.username} is your new alumn.<br>Greetings.`,
              };
              sendEmail(mailObjTeacher);
            })
            .catch(console.log);
        })
        .catch(console.log);
    }

    sendEmail(mailObjCoustomer);

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
