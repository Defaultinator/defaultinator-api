require('dotenv').config();

const DEFAULT_PORT = 3000;
const DEFAULT_DATABASE_URI = 'mongodb://localhost:27017/defaultinator';

const SERVER_PORT = process.env.DEFAULT_PORT || process.env.PORT || DEFAULT_PORT;
const DATABASE_URI = process.env.DATABASE_URI || DEFAULT_DATABASE_URI;
const ROOT_KEY = process.env.ROOT_KEY || null;

module.exports = {
  SERVER_PORT,
  DATABASE_URI,
  ROOT_KEY,
};
