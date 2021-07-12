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
  Favorite,
} = require('./models');

main().catch((err) => console.error(err));

async function main() {
  await initFavs();
  mongoose.connection.close();
}

async function initFavs() {
  const { deletedCount } = await Favorite.deleteMany();
  console.log(
    `Eliminado${deletedCount !== 1 ? 's' : ''} ${deletedCount} favorito${
      deletedCount !== 1 ? 's' : ''
    }.`,
  );

  const result = await Favorite.insertMany([
    {
      user: await User.findOne({ email: 'usuario616@gmail.com' }),
      course: await Course.findOne({ title: 'Curso 11' }),
    },
    {
      user: await User.findOne({ email: 'usuario616@gmail.com' }),
      course: await Course.findOne({ title: 'Curso 2' }),
    },
    {
      user: await User.findOne({ email: 'admin@example.com' }),
      course: await Course.findOne({ title: 'Curso 2' }),
    },
  ]);
  console.log(
    `Insertado${result.length !== 1 ? 's' : ''} ${result.length} favorito${
      result.length !== 1 ? 's' : ''
    }.`,
  );
  const usu = await User.findOne({ email: 'usuario616@gmail.com' });
  const cou = await Course.findOne({ title: 'Curso 2' });
  const res = await Favorite.find({ user: usu, course: cou }).populate(
    'course',
  );

  console.log(res.length > 0);
}
