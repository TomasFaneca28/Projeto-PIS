const db = require('../db/db');

// Middleware para verificar se o utilizador é admin
const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'É necessário estar autenticado' });
  }

  // Verificar o tipo de utilizador na base de dados
  const query = 'SELECT tipo FROM utilizador WHERE id = ?';
  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar tipo de utilizador:', err);
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    const tipoUtilizador = results[0].tipo;

    if (tipoUtilizador !== 2) {
      return res.status(403).json({ error: 'Apenas administradores podem realizar esta ação' });
    }

    next();
  });
};

module.exports = requireAdmin;
