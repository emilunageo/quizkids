const express = require('express');
const router = express.Router();
const quizzesController = require('../controllers/quizzesController');
const isAuthenticated = require('../middlewares/authMiddleware'); // Importa el middleware de autenticación

// Mostrar el formulario para crear un nuevo quiz
router.get('/new', isAuthenticated, quizzesController.showCreateQuizForm);

// Procesar la creación del nuevo quiz
router.post('/create', isAuthenticated, quizzesController.createQuiz);

module.exports = router;
