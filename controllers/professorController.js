const Professor = require('../models/professor');
const Class = require('../models/class');

const professorController = {};

professorController.home = (req, res) => {
    res.render('professor/index', { user: req.session.userId });
};

professorController.perfil = (req, res) => {
    res.render('professor/perfil', { user: req.session.userId });
};

professorController.dashboard = (req, res) => {
    res.render('professor/dashboard', { user: req.session.userId });
};

professorController.crearQuiz = (req, res) => {
    // Lógica para crear un quiz
    res.render('professor/crearQuiz', { user: req.session.userId });
};

module.exports = professorController;
