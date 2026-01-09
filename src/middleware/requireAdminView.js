const db = require('../db/db');

// Middleware para permitir acesso apenas a admins 
const requireAdminView = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }

  // Verificar o tipo de utilizador na base de dados
  const query = 'SELECT tipo FROM utilizador WHERE id = ?';
  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar tipo de utilizador:', err);
      return res.redirect('/');
    }

    if (results.length === 0) {
      return res.redirect('/');
    }

    const tipoUtilizador = results[0].tipo;

    if (tipoUtilizador !== 2) {
      return res.redirect('/');
    }

    next();
  });
};

module.exports = requireAdminView;
