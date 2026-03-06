const express = require('express');
const { createPayment, capturePayment } = require('../controllers/paymentController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/create', auth, createPayment);
router.post('/capture', auth, capturePayment);

module.exports = router;