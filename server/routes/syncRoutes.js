const express = require('express');
const router = express.Router();

// Placeholder GET endpoint for syncing email
router.get('/', (req, res) => {
  res.send('Sync route is working!');
});

module.exports = router;
