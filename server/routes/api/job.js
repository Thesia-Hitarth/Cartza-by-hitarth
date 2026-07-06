const express = require('express');
const router = express.Router();
const { processAbandonedCarts } = require('../../jobs/abandonedCart');

router.get('/abandoned-cart', async (req, res) => {
  try {
    // Vercel sets CRON_SECRET in env, and passes Bearer CRON_SECRET in the Authorization header
    // Ref: https://vercel.com/docs/cron-jobs#securing-cron-jobs
    const authHeader = req.headers.authorization;
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction && (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sentCount = await processAbandonedCarts();
    res.status(200).json({ success: true, emailsSent: sentCount });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Job execution failed.' });
  }
});

module.exports = router;
