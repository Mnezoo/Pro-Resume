const express = require('express');
const { createResume, getResumes, updateResume } = require('../controllers/resumeController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createResume);
router.get('/', auth, getResumes);
router.put('/:id', auth, updateResume);

module.exports = router;