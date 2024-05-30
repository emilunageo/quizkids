function isAuthenticated(req, res, next) {
    if (req.session.user) {
        req.user = req.session.user; // Asegurar que req.user esté disponible
        console.log("Usuario autenticado en middleware:", req.user); // Log para verificar
        next();
    } else {
        res.redirect('/login');
    }
}

module.exports = isAuthenticated;
