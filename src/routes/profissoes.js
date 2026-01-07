const express = require('express');
const router = express.Router();
const db= require('../db/db');


// GET all professions
router.get('/', (req, res) => {
    db.query('SELECT * FROM TipoProfissao', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// POST add new profession
router.post('/', (req, res) => {
    const { tipo} = req.body;
    db.query(
        'INSERT INTO TipoProfissao (tipo) VALUES (?)',
        [tipo || null],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ id: result.insertId});
        }
    );
});

// PUT update profession
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { tipo } = req.body;
    db.query(
        'UPDATE TipoProfissao SET tipo = ? WHERE id = ?',
        [tipo || null, id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ id, tipo });
        }
    );
});

// DELETE profession
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM TipoProfissao WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

module.exports=router;