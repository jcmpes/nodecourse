'use strict';
require('dotenv').config();
var Chance = require('chance');
var chance = new Chance();

const { ObjectId } = require('bson');
const fs = require('fs');

// eslint-disable-next-line no-unused-vars
const {
  mongoose,
  connectMongoose,
  User,
  Course,
  Category,
  Favorite,
  Purchase,
} = require('./models');
const { parse } = require('dotenv');

main().catch((err) => console.error(err));

async function main() {
  await initUsers();
  await initCategories();
  await initCourses();
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
      activated: true,
    },
  ];

  for (let i = 1; i < 11; i++) {
    users.push({
      email: chance.word({ length: i }) + '@achilipu.com',
      password: await User.hashPassword(chance.string({ length: 4 })),
      username: chance.name(),
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

  const courses = [];

  for (let i = 3; i < 20; i++) {
    const title = chance.sentence({ words: 4 });
    const R = Math.floor(Math.random() * 11);
    const userC = await User.findOne({}).limit(1).skip(R);
    const RCat = Math.floor(Math.random() * 20);
    const catC = await Category.findOne({}).limit(1).skip(RCat);
    courses.push({
      title,
      slug: title.replace(' ', '-'),
      user: userC._id,
      category: catC._id,
      featuredImage: chance.word(),
      video: chance.word(),
      description: chance.sentence({ length: 10 }),
      content: chance.paragraph({ sentences: 3 }),
      createdAt: Date.now(),
      image:
        'https://final-project-web-x.s3.amazonaws.com/3dfd522dc764b3f2e647cfa6f22b6e83',
    });
  }

  const result = await Course.insertMany(courses);
  console.log(
    `Insertado${result.length !== 1 ? 's' : ''} ${result.length} curso${
      result.length !== 1 ? 's' : ''
    }.`,
  );
}

async function initCategories() {
  const { deletedCount } = await Category.deleteMany();
  console.log(
    `Eliminada${deletedCount !== 1 ? 's' : ''} ${deletedCount} categoria${
      deletedCount !== 1 ? 's' : ''
    }.`,
  );

  const categories = [];

  for (let i = 0; i < 20; i++) {
    const name = chance.word();
    categories.push({
      name,
      description: chance.sentence({ length: 10 }),
      slug: name,
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

async function initFavs() {
  const { deletedCount } = await Favorite.deleteMany();
  console.log(
    `Eliminado${deletedCount !== 1 ? 's' : ''} ${deletedCount} favorito${
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

  const result = await Purchase.insertMany([
    {
      price: 16.99,
      date: Date.now(),
      paymentCode: '1d3f9a1HkND4xX0hT7cSj7e2d',
      user: await User.findOne({}),
      courses: await Course.find({}),
    },
    {
      price: 20,
      date: Date.now(),
      paymentCode: '2d3f9a1HkND4xX0hT7cSj7e2d',
      user: await User.findOne({}),
      courses: await Course.find({}),
    },
    {
      price: 12.5,
      date: Date.now(),
      paymentCode: '3d3f9a1HkND4xX0hT7cSj7e2d',
      user: await User.findOne({}),
      courses: await Course.find({}),
    },
    {
      price: 25,
      date: Date.now(),
      paymentCode: '4d3f9a1HkND4xX0hT7cSj7e2d',
      user: await User.findOne({}),
      courses: await Course.find({}),
    },
    {
      price: 9.99,
      date: Date.now(),
      paymentCode: '5d3f9a1HkND4xX0hT7cSj7e2d',
      user: await User.findOne({}),
      courses: await Course.find({}),
    },
    {
      price: 14.99,
      date: Date.now(),
      paymentCode: '6d3f9a1HkND4xX0hT7cSj7e2d',
      user: await User.findOne({}),
      courses: await Course.find({}),
    },
  ]);

  console.log(`- ${result.length} inserted`);
};
