const express = require('express');
const router = express.Router();
const db= require('../db/db');
const requireAdmin = require('../middleware/requireAdmin');


// GET all professions
router.get('/', async (req, res) => {
  try {
    const generos = await query('SELECT * FROM Genero ORDER BY nome');
    res.json(generos);
  } catch (err) {
    console.error('Erro ao listar géneros:', err);
    res.status(500).json({ error: 'Erro ao listar géneros' });
  }
});

// POST add new profession
router.post('/', requireAdmin, (req, res) => {
    const {nome} = req.body;
    db.query(
        'INSERT INTO Genero (nome) VALUES (?)',
        [nome || null],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ id: result.insertId});
        }
    );
});

// PUT update profession
router.put('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    db.query(
        'UPDATE Genero SET nome = ? WHERE id = ?',
        [nome || null, id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ id, nome });
        }
    );
});

// DELETE profession
router.delete('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Genero WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

module.exports=router;