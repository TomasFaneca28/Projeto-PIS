const express = require('express');
const router = express.Router();
const db = require('../db/db');
const securePassword = require('../services/securePassword');
const requireLogin = require('../middleware/requireLogin');

router.post('/registo', async (req, res) => {
  const { nome, email, password, confirmPassword } = req.body;

  // Validar campos obrigatorios
  if (!nome || !email || !password || !confirmPassword) {
    return res.status(400).json({error: 'Todos os campos sao obrigatorios' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({error: 'As palavras-passe nao coincidem' });
  }

  const getTipoIdQuery = 'SELECT id FROM tipoutilizador WHERE tipo = "normalUser"';
  
  // Obter o ID do tipo de utilizador "normalUser"
  db.query(getTipoIdQuery, (err, results) => {
    if (err) {
      return res.status(500).json({error: 'Erro ao obter o tipo de utilizador' });
    }
    
    if (results.length === 0) {
      return res.status(500).json({error: 'Tipo de utilizador não encontrado' });
    }

    const tipoId = results[0].id;

    // Verificar se o email ja esta registado
    const verificaEmailQuery = 'SELECT * FROM utilizador WHERE email = ?';
    db.query(verificaEmailQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({error: 'Erro ao verificar o email' });
      }

      if (results.length > 0) {
        return res.status(400).json({error: 'Email ' + email + ' ja esta registado' });
      }

      // Inserir o novo utilizador na base de dados
      const hashPassword = await securePassword.hash(password);

      const insertQuery = 'INSERT INTO utilizador (username, password, email, tipo) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [nome, hashPassword, email, tipoId], (err, results) => {
        if (err) {
          return res.status(500).json({error: 'Erro ao criar utilizador' });
        }
        res.status(201).json({ message: 'Utilizador registado com sucesso', userId: results.insertId });
      
      });
    });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({error: 'Email e palavra-passe sao obrigatorios' });
  }

  // Procura apenas o utilizador com o email fornecido
  const query = 'SELECT * FROM utilizador WHERE email = ?';
  db.query(query, [email], async (err, results) => {

    if (err) {
      return res.status(500).json({error: 'Erro no servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({error: 'Email '+ email + ' nao se encontra registado' });
    }

    const user = results[0];

    // Compara a password com hash com a password na base de dados
    const match = await securePassword.verify(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Email ou palavra-passe incorretos' });
    }

    // Guardar a sessão do utilizador
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.username = user.username;

    res.status(200).json({ message: 'Login efetuado com sucesso', userId: user.id });
  
  });

});

// POST /logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.status(200).json({ message: 'Logout efetuado com sucesso' });
  });
});

router.get('/user-info', requireLogin, (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Utilizador não autenticado' });
  }

  const query = 'SELECT id, username, email FROM utilizador WHERE id = ?';
  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao obter informações do utilizador' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    const user = results[0];
    res.status(200).json({
      userId: user.id,
      username: user.username,
      email: user.email,
    });
  });
});

// GET /favoritos - Obter filmes favoritos do utilizador
router.get('/favoritos', requireLogin, (req, res) => {

  const query = `
    SELECT f.id, f.nome, f.tipo, f.posterPath, f.DataLancamento, f.sinopese
    FROM Favorito fav
    INNER JOIN Filme f ON fav.idFilme = f.id
    WHERE fav.idUtilizador = ?
    ORDER BY f.nome ASC
  `;

  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao obter filmes favoritos' });
    }
    res.status(200).json(results || []);
  });
});

// GET /reviews - Obter reviews do utilizador
router.get('/reviews', requireLogin, (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Utilizador não autenticado' });
  }

  const query = `
    SELECT r.id, r.avaliacao, r.critica, r.dataReview, r.votosUtilidade,
           f.id AS filmeId, f.nome AS filmeNome, f.posterPath
    FROM Review r
    INNER JOIN Filme f ON r.idFilme = f.id
    WHERE r.idUtilizador = ?
    ORDER BY r.dataReview DESC
  `;

  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao obter reviews' });
    }
    res.status(200).json(results || []);
  });
});

module.exports = router;
