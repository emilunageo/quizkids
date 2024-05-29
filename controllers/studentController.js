const studentController = {};

studentController.home = (req, res) => {
    res.render('student/index', { user: req.session.userId });
};

studentController.perfil = (req, res) => {
    res.render('student/perfil', { user: req.session.userId });
};

studentController.ranking = (req, res) => {
    res.render('student/ranking', { user: req.session.userId });
};

module.exports = studentController;
