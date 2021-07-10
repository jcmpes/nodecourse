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
} = require('./models');

main().catch((err) => console.error(err));

async function main() {
  // await initUsers();
  await initCategories();
  await initCourses();
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
      user: await User.findOne({}),
      category: await Category.findOne({}),
      featuredImage: '',
      video: 'https://youtu.be/rfscVS0vtbw',
      description: 'This is description for course 1',
      content: 'This is the content fo course 1',
      createdAt: Date.now(),
    },
    {
      title: 'Curso 2',
      user: await User.findOne({}),
      category: await Category.findOne({}),
      featuredImage: '',
      video: 'https://youtu.be/rfscVS0vtbw',
      description: 'This is description for course 2',
      content: 'This is the content fo course 2',
      createdAt: Date.now(),
    },
    {
      title: 'Curso 3',
      user: await User.findOne({}),
      category: await Category.findOne({}),
      featuredImage: '',
      video: 'https://youtu.be/rfscVS0vtbw',
      description: 'This is description for course 3',
      content: 'This is the content fo course 3',
      createdAt: Date.now(),
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
