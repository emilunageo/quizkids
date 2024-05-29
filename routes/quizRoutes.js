const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.post('/createQuiz', quizController.createQuiz);

module.exports = router;
