const express = require('express');
const router = express.Router();
const db= require('../db/db');

// GET todas pessoas com a profissão
router.get('/', (req, res) => {
  const sql = `
    SELECT p.id, p.nome, p.tipo AS professionId, t.tipo AS professionName
    FROM Pessoa p
    LEFT JOIN TipoProfissao t ON p.tipo = t.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    const people = results.map(r => ({
      id: r.id,
      name: r.nome,
      professionId: r.professionId,
      professionName: r.professionName
    }));
    res.json(people);
  });
});

// POST nova pessoa
router.post('/', (req, res) => {
  const { name, professionId } = req.body;
  db.query(
    'INSERT INTO Pessoa (nome, tipo) VALUES (?, ?)',
    [name, professionId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, name, professionId });
    }
  );
});

// DELETE pessoa
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM Pessoa WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.id, p.nome AS name, p.tipo AS professionId, t.tipo AS professionName
    FROM Pessoa p
    LEFT JOIN TipoProfissao t ON p.tipo = t.id
    WHERE p.id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });
    res.json(results[0]);
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, professionId } = req.body;
  db.query(
    'UPDATE Pessoa SET nome = ?, tipo = ? WHERE id = ?',
    [name, professionId, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

module.exports=router;