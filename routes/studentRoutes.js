
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', studentController.home);
router.get('/perfil', studentController.perfil);
router.get('/ranking', studentController.ranking);
/* router.post('/agregar-clase', studentController.agregarClase);
router.post('/quiz/:quizId/resultados', studentController.guardarResultados); */

module.exports = router;
