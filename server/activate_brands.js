const chalk = require('chalk');
const mongoose = require('mongoose');

const setupDB = require('./utils/db');
const Brand = require('./models/brand');
const Merchant = require('./models/merchant');

const activateApprovedBrands = async () => {
  try {
    console.log(`${chalk.blue('✓')} Starting brand activation script...`);

    // 1. Find all approved merchants
    const approvedMerchants = await Merchant.find({ status: 'Approved' }).select('_id name');
    console.log(`${chalk.blue('✓')} Found ${approvedMerchants.length} approved merchants.`);

    if (approvedMerchants.length === 0) {
      console.log(`${chalk.yellow('!')} No approved merchants found.`);
      return;
    }

    const merchantIds = approvedMerchants.map(m => m._id);

    // 2. Update their brands to isActive: true
    const result = await Brand.updateMany(
      { merchant: { $in: merchantIds }, isActive: false },
      { $set: { isActive: true } }
    );

    console.log(`${chalk.green('✓')} Successfully activated ${result.modifiedCount} inactive brand(s) for approved merchants.`);
  } catch (error) {
    console.log(`${chalk.red('x')} Error during brand activation:`);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log(`${chalk.blue('✓')} Database connection closed.`);
  }
};

(async () => {
  try {
    await setupDB();
    // Wait a brief moment to ensure connection has completed and chalk prints it
    setTimeout(async () => {
      await activateApprovedBrands();
    }, 1000);
  } catch (error) {
    console.error(`Initialization error: ${error.message}`);
  }
})();
