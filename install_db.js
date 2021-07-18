'use strict';
require('dotenv').config();

const { ObjectId } = require('bson');
const fs = require('fs');

// eslint-disable-next-line no-unused-vars
const {
  mongoose,
  connectMongoose,
  User,
  Course,
  Category,
  Purchase,
} = require('./models');

main().catch((err) => console.error(err));

async function main() {
  await initUsers();
  await initCourses();
  await initCategories();
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

  const result = await User.insertMany([
    {
      email: process.env.USER_EMAIL,
      password: await User.hashPassword(process.env.USER_PASSWORD),
      username: 'Pepe',
      activated: true,
    },
  ]);
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

  const result = await Course.insertMany([
    {
      title: 'Curso 11',
      slug: 'curso-11',
      user: await User.findOne({}),
      category: await Category.findOne({}),
      featuredImage: '',
      video: 'rfscVS0vtbw',
      description: 'This is description for course 1',
      content: 'This is the content fo course 1',
      createdAt: Date.now(),
      image:
        'https://final-project-web-x.s3.amazonaws.com/3dfd522dc764b3f2e647cfa6f22b6e83',
    },
    {
      title: 'Curso 2',
      slug: 'curso-2',
      user: await User.findOne({}),
      category: await Category.findOne({}),
      featuredImage: '',
      video: 'OXE2a8dqIAI',
      description: 'This is description for course 2',
      content: 'This is the content fo course 2',
      createdAt: Date.now(),
      image:
        'https://final-project-web-x.s3.amazonaws.com/80c33335d9463bfa647551e928ef1c86',
    },
    {
      title: 'Curso 3',
      slug: 'curso-3',
      user: await User.findOne({}),
      category: await Category.findOne({}),
      featuredImage: '',
      video: 'Kyx2PsuwomE',
      description: 'This is description for course 3',
      content: 'This is the content fo course 3',
      createdAt: Date.now(),
      image:
        'https://final-project-web-x.s3.amazonaws.com/dbd147e64dbb31425ad98c8ea070c23d',
    },
  ]);
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

  const result = await Category.insertMany([
    {
      name: 'Categoria 1',
      description: 'This is the description of Categoria 1',
      slug: 'categoria-1',
      courses: [],
    },
    {
      name: 'Categoria 2',
      description: 'This is the description of Categoria 2',
      slug: 'categoria-2',
      courses: [],
    },
    {
      name: 'Categoria 2',
      description: 'This is the description of Categoria 2',
      slug: 'categoria-2',
      courses: [],
    },
    {
      name: 'Categoria 3',
      description: 'This is the description of Categoria 3',
      slug: 'categoria-3',
      courses: [],
    },
  ]);
  console.log(
    `Insertada${result.length !== 1 ? 's' : ''} ${result.length} categoria${
      result.length !== 1 ? 's' : ''
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
      courses: [],
    },
    {
      price: 20,
      date: Date.now(),
      paymentCode: '2d3f9a1HkND4xX0hT7cSj7e2d',
      user: await User.findOne({}),
      courses: [],
    },
    {
      price: 12.5,
      date: Date.now(),
      paymentCode: '3d3f9a1HkND4xX0hT7cSj7e2d',
      user: await User.findOne({}),
      courses: [],
    },
    {
      price: 25,
      date: Date.now(),
      paymentCode: '4d3f9a1HkND4xX0hT7cSj7e2d',
      user: await User.findOne({}),
      courses: [],
    },
    {
      price: 9.99,
      date: Date.now(),
      paymentCode: '5d3f9a1HkND4xX0hT7cSj7e2d',
      user: await User.findOne({}),
      courses: [],
    },
    {
      price: 14.99,
      date: Date.now(),
      paymentCode: '6d3f9a1HkND4xX0hT7cSj7e2d',
      user: await User.findOne({}),
      courses: [],
    },
  ]);

  console.log(`- ${result.length} inserted`);
};
