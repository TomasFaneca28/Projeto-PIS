const express = require('express');
const router = express.Router();
const db= require('../db/db');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', (req, res) => {
  const sql = `
    SELECT 
      p.id,
      p.nome,
      p.tipo AS professionId,
      t.tipo AS professionName,
      p.photopath,
      p.dataNascimento,
      p.nacionalidade
    FROM Pessoa p
    LEFT JOIN TipoProfissao t ON p.tipo = t.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);

    const people = results.map(r => ({
      id: r.id,
      nome: r.nome,
      professionId: r.professionId,
      professionName: r.professionName,
      photoPath: r.photopath,
      dataNasc: r.dataNascimento,
      nationalidade: r.nacionalidade
    }));

    res.json(people);
  });
});


router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      p.id,
      p.nome AS nome,
      p.tipo AS professionId,
      t.tipo AS professionName,
      p.photopath AS photoPath,
      p.dataNascimento AS dataNasc,
      p.nacionalidade AS nacionalidade
    FROM Pessoa p
    LEFT JOIN TipoProfissao t ON p.tipo = t.id
    WHERE p.id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0)
      return res.status(404).json({ error: 'Pessoa não encontrada' });

    res.json(results[0]);
  });
});

// POST nova pessoa
router.post('/', requireAdmin, (req, res) => {
  const {
    nome,
    professionId,
    photoPath,
    dataNasc,
    nacionalidade
  } = req.body;

  db.query(
    `INSERT INTO Pessoa (nome, tipo, photopath, dataNascimento, nacionalidade)
     VALUES (?, ?, ?, ?, ?)`,
     
    [nome, professionId, photoPath || null, dataNasc || null, nacionalidade || null],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        id: result.insertId,
        nome,
        professionId,
        photoPath,
        dataNasc,
        nacionalidade
      });
    }
  );
});

// PUT atualizar pessoa
router.put('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const {
    nome,
    professionId,
    photoPath,
    dataNasc,
    nacionalidade
  } = req.body;

  db.query(
    `UPDATE Pessoa
     SET nome = ?, tipo = ?, photopath = ?, dataNascimento = ?, nacionalidade = ?
     WHERE id = ?`,
    [nome, professionId, photoPath || null, dataNasc || null, nacionalidade || null, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

// DELETE pessoa
router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM Pessoa WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});


module.exports=router;