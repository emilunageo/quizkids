const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');

router.get('/', professorController.home);
router.get('/perfil', professorController.perfil);
router.get('/dashboard', professorController.dashboard);
router.get('/crearQuiz', professorController.crearQuiz);

module.exports = router;
