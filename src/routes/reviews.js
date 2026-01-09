const express = require('express');
const router = express.Router();
const db = require('../db/db');

// POST /api/reviews - Criar uma nova review
router.post('/', async (req, res) => {
  const { filmeId, avaliacao, critica } = req.body;
  
  // Verificar se o utilizador está autenticado 
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: null, error: 'É necessário estar autenticado para criar uma review' });
  }

  const userId = req.session.userId;

  // Validar campos obrigatórios
  if (!filmeId || !avaliacao) {
    return res.status(400).json({ message: null, error: 'FilmeId e avaliação são obrigatórios' });
  }

  if (avaliacao < 1 || avaliacao > 5) {
    return res.status(400).json({ message: null, error: 'Avaliação deve estar entre 1 e 5' });
  }

  // Verificar se o utilizador já fez review deste filme
  const checkQuery = 'SELECT * FROM Review WHERE idUtilizador = ? AND idFilme = ?';
  db.query(checkQuery, [userId, filmeId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar reviews:', err);
      return res.status(500).json({ message: null, error: 'Erro ao verificar reviews existentes' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: null, error: 'Já fez uma review para este filme' });
    }

    // Inserir a review
    const insertQuery = 'INSERT INTO Review (idUtilizador, idFilme, avaliacao, critica, dataReview, votosUtilidade) VALUES (?, ?, ?, ?, NOW(), 0)';
    db.query(insertQuery, [userId, filmeId, avaliacao, critica || null], (err, results) => {
      if (err) {
        console.error('Erro ao inserir review:', err);
        return res.status(500).json({ message: null, error: 'Erro ao criar review' });
      }

      res.status(201).json({ 
        message: 'Review criada com sucesso', 
        error: null, 
        reviewId: results.insertId 
      });
    });
  });
});

// POST /api/reviews/:id/util - Marcar review como útil
router.post('/:id/util', (req, res) => {
  const reviewId = req.params.id;

  // Verificar se o utilizador está autenticado
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: null, error: 'É necessário estar autenticado' });
  }

  const userId = req.session.userId;

  // Verificar se o utilizador já marcou esta review como útil
  const checkQuery = 'SELECT * FROM ReviewUtil WHERE idUtilizador = ? AND idReview = ?';
  db.query(checkQuery, [userId, reviewId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar marcações:', err);
      return res.status(500).json({ message: null, error: 'Erro ao verificar marcações' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: null, error: 'Já marcou esta review como útil' });
    }

    // Inserir marcação de útil
    const insertQuery = 'INSERT INTO ReviewUtil (idUtilizador, idReview) VALUES (?, ?)';
    db.query(insertQuery, [userId, reviewId], (err, results) => {
      if (err) {
        console.error('Erro ao marcar como útil:', err);
        return res.status(500).json({ message: null, error: 'Erro ao marcar como útil' });
      }

      // Atualizar contador de votos de utilidade na review
      const updateQuery = 'UPDATE Review SET votosUtilidade = COALESCE(votosUtilidade, 0) + 1 WHERE id = ?';
      db.query(updateQuery, [reviewId], (err, results) => {
        if (err) {
          console.error('Erro ao atualizar contador:', err);
          return res.status(500).json({ message: null, error: 'Erro ao atualizar contador' });
        }

        res.status(200).json({ 
          message: 'Review marcada como útil', 
          error: null 
        });
      });
    });
  });
});

module.exports = router;
