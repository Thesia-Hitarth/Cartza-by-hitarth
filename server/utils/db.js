require('dotenv').config();
const dns = require('dns');

// Resolve querySrv ECONNREFUSED issues on local machines/ISPs that block/fail SRV lookups
dns.setServers(['8.8.8.8', '8.8.4.4']);

const chalk = require('chalk');
const mongoose = require('mongoose');

const keys = require('../config/keys');
const { database } = keys;

const setupDB = async () => {
  try {
    // Connect to MongoDB
    mongoose.set('useCreateIndex', true);
    mongoose
      .connect(database.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
      .then(() =>
        console.log(`${chalk.green('✓')} ${chalk.blue('MongoDB Connected!')}`)
      )
      .catch(err => console.log(err));
  } catch (error) {
    return null;
  }
};

module.exports = setupDB;
