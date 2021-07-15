'use strict';
process.chdir(__dirname);
require('dotenv').config();

const { mongoose, User } = require('./models');

main().catch((err) => console.error(err));

async function main() {
  await purgeNonActivated();
  mongoose.connection.close();
}

async function purgeNonActivated() {
  const { deletedCount } = await User.deleteMany({
    activated: false,
    verifyTokenExpires: {
      $lte: Date.now() - 1000 * 60 * 60,
    },
  });
  console.log(
    `Eliminado${deletedCount !== 1 ? 's' : ''} ${deletedCount} usuario${
      deletedCount !== 1 ? 's' : ''
    } inactivo${deletedCount !== 1 ? 's' : ''}.`,
  );
}
