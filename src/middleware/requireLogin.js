// Middleware para verificar se o utilizador esta autenticado
const requireLogin = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

module.exports = requireLogin;
