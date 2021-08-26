'use strict';
require('dotenv').config();
var Chance = require('chance');
var chance = new Chance();

const { ObjectId } = require('bson');
const fs = require('fs');
const txtgen = require('txtgen');

// eslint-disable-next-line no-unused-vars
const {
  mongoose,
  connectMongoose,
  User,
  Course,
  Lesson,
  Level,
  Category,
  Favorite,
  Purchase,
} = require('./models');
const { parse } = require('dotenv');

const categoryNames = ['Sciences', 'Arts', 'Programming', 'Sports'];
const levelNames = ['Basic', 'Medium', 'Hard', 'Expert'];

const images = [
  'https://final-project-web-x.s3.amazonaws.com/test-1628981970289.jpg',
  'https://final-project-web-x.s3.amazonaws.com/3dfd522dc764b3f2e647cfa6f22b6e83',
  'https://final-project-web-x.s3.amazonaws.com/AD053B9C-8D71-481B-935F-E5365241BD77-1628844556785.jpeg',
  'https://final-project-web-x.s3.amazonaws.com/monte-1628841349601.png',
  'https://final-project-web-x.s3.amazonaws.com/manos-1628841099367.png',
];

main().catch((err) => console.error(err));

async function main() {
  await initUsers();
  await initCategories();
  await initCourses();
  await initLessons();
  await initLevels();
  await initFavs();
  await initPurchases();
  mongoose.connection.close();
}

async function initUsers() {
  const { deletedCount } = await User.deleteMany();
  console.log(
    `Eliminado${deletedCount !== 1 ? 's' : ''} ${deletedCount} usuario${
      deletedCount !== 1 ? 's' : ''
    }.`,
  );

  const users = [
    {
      email: process.env.USER_EMAIL,
      password: await User.hashPassword(process.env.USER_PASSWORD),
      username: 'Pepe',
      courses: [],
      activated: true,
    },
  ];

  for (let i = 1; i < 11; i++) {
    const username = chance.name();
    users.push({
      email: username.toLowerCase().replace(' ', '-') + '@test.com',
      password: await User.hashPassword('1234'),
      username,
      courses: [],
      activated: true,
    });
  }

  const result = await User.insertMany(users);
  console.log(
    `Insertado${result.length !== 1 ? 's' : ''} ${result.length} usuario${
      result.length !== 1 ? 's' : ''
    }.`,
  );
}

async function initCourses() {
  const { deletedCount } = await Course.deleteMany();
  console.log(
    `Eliminado${deletedCount !== 1 ? 's' : ''} ${deletedCount} curso${
      deletedCount !== 1 ? 's' : ''
    }.`,
  );

  // const courses = [];

  for (let i = 0; i < 20; i++) {
    const title = txtgen.sentence();
    const R = Math.floor(Math.random() * 11);
    const userC = await User.findOne({}).limit(1).skip(R);
    const RCat = Math.floor(Math.random() * categoryNames.length);
    const catC = await Category.findOne({}).limit(1).skip(RCat);
    const RLev = Math.floor(Math.random() * levelNames.length);
    const levC = await Level.findOne({}).limit(1).skip(RCat);
    const newOne = new Course({
      title,
      user: userC._id,
      category: catC._id,
      video: 'E6TUs69Cw94',
      description: txtgen.sentence(),
      content: chance.paragraph({ sentences: 3 }),
      requirements: txtgen.sentence(),
      whatYouWillLearn: txtgen.sentence(),
      level: levC._id,
      price: chance.integer({ min: 10, max: 100 }),
      createdAt: Date.now(),
      image: images[Math.floor(Math.random() * images.length)],
    });
    await newOne.save();
    console.log('Inserted ', newOne.title);

    const lessons = [];
    for (let i = 0; i < 5; i++) {
      const newLesson = new Lesson({
        title: txtgen.sentence(),
        video: 'E6TUs69Cw94',
        description: txtgen.sentence(),
        content: txtgen.paragraph(),
        number: i,
      });
      const saved = await newLesson.save();
      // const saved = await Lesson.insertMany([newLesson]);
      lessons.push(newLesson);
    }
    newOne.lessons = lessons;
    await newOne.save();
  }
  //const result = await Course.insertMany(courses);
  // console.log(
  //   `Insertado${result.length !== 1 ? 's' : ''} ${result.length} curso${
  //     result.length !== 1 ? 's' : ''
  //   }.`,
  // );
}

async function initCategories() {
  const { deletedCount } = await Category.deleteMany();
  console.log(
    `Eliminada${deletedCount !== 1 ? 's' : ''} ${deletedCount} categoria${
      deletedCount !== 1 ? 's' : ''
    }.`,
  );

  const categories = [];

  for (let i = 0; i < categoryNames.length; i++) {
    categories.push({
      name: categoryNames[i],
      description: chance.sentence({ length: 10 }),
      courses: [],
    });
  }
  const result = await Category.insertMany(categories);
  console.log(
    `Insertada${result.length !== 1 ? 's' : ''} ${result.length} categoria${
      result.length !== 1 ? 's' : ''
    }.`,
  );
}

async function initLevels() {
  const { deletedCount } = await Level.deleteMany();
  console.log(
    `Eliminado${deletedCount !== 1 ? 's' : ''} ${deletedCount} nivel${
      deletedCount !== 1 ? 'es' : ''
    }.`,
  );

  const levels = [];

  for (let i = 0; i < levelNames.length; i++) {
    levels.push({
      name: levelNames[i],
      description: chance.sentence({ length: 10 }),
    });
  }
  const result = await Level.insertMany(levels);
  console.log(
    `Insertado${result.length !== 1 ? 's' : ''} ${result.length} nivel${
      result.length !== 1 ? 'es' : ''
    }.`,
  );
}

async function initFavs() {
  const { deletedCount } = await Favorite.deleteMany();
  console.log(
    `Eliminado${deletedCount !== 1 ? 's' : ''} ${deletedCount} favorito${
      deletedCount !== 1 ? 's' : ''
    }.`,
  );
}

async function initLessons() {
  const { deletedCount } = await Lesson.deleteMany();
  console.log(
    `Eliminado${deletedCount !== 1 ? 's' : ''} ${deletedCount} lesson${
      deletedCount !== 1 ? 's' : ''
    }.`,
  );
}

const initPurchases = async () => {
  const { deletedCount } = await Purchase.deleteMany();
  console.log(
    `Purchases:
- ${deletedCount} deleted`,
  );

  // const result = await Purchase.insertMany([
  //   {
  //     purchasePrice: 16.99,
  //     purchaseDate: Date.now(),
  //     paymentCode: '1d3f9a1HkND4xX0hT7cSj7e2d',
  //     username: 'Jane',
  //     courses: [],
  //   },
  //   {
  //     purchasePrice: 20,
  //     purchaseDate: Date.now(),
  //     paymentCode: '2d3f9a1HkND4xX0hT7cSj7e2d',
  //     username: 'John',
  //     courses: [],
  //   },
  //   {
  //     purchasePrice: 12.5,
  //     purchaseDate: Date.now(),
  //     paymentCode: '3d3f9a1HkND4xX0hT7cSj7e2d',
  //     username: 'Juana',
  //     courses: [],
  //   },
  //   {
  //     purchasePrice: 25,
  //     purchaseDate: Date.now(),
  //     paymentCode: '4d3f9a1HkND4xX0hT7cSj7e2d',
  //     username: 'Juan',
  //     courses: [],
  //   },
  //   {
  //     purchasePrice: 9.99,
  //     purchaseDate: Date.now(),
  //     paymentCode: '5d3f9a1HkND4xX0hT7cSj7e2d',
  //     username: 'Lucas',
  //     courses: [],
  //   },
  //   {
  //     purchasePrice: 14.99,
  //     purchaseDate: Date.now(),
  //     paymentCode: '6d3f9a1HkND4xX0hT7cSj7e2d',
  //     username: 'Sara',
  //     courses: [],
  //   },
  // ]);

  // console.log(`- ${result.length} inserted`);
};
