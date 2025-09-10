const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');

// just a dummy route to check JWT
router.get('/me', auth(), (req, res) => {
  res.json({ user: req.user });
});

// only admin allowed
router.get('/admin-only', auth('admin'), (req, res) => {
  res.json({ msg: 'Welcome Admin', user: req.user });
});

module.exports = router;
