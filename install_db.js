'use strict';
require('dotenv').config();

const fs = require('fs');

// eslint-disable-next-line no-unused-vars
const { mongoose, connectMongoose, User } = require('./models');

main().catch(err => console.error(err));

async function main() {
  await initUsers();
  mongoose.connection.close();
}

async function initUsers() {
  const { deletedCount } = await User.deleteMany();
  console.log(
    `Eliminado${deletedCount !== 1 ? 's' : ''} ${deletedCount} usuario${
      deletedCount !== 1 ? 's' : ''
    }.`
  );

  const result = await User.insertMany([
    {
      email: process.env.USER_EMAIL,
      password: await User.hashPassword(process.env.USER_PASSWORD),
      username: 'Pepe',
    },
  ]);
  console.log(
    `Insertado${result.length !== 1 ? 's' : ''} ${result.length} usuario${
      result.length !== 1 ? 's' : ''
    }.`
  );
}
