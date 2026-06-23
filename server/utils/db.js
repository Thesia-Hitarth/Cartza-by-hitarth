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
    await mongoose.connect(database.url);
    console.log(`${chalk.green('✓')} ${chalk.blue('MongoDB Connected!')}`);
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = setupDB;
