const express = require('express');
const router = express.Router();
const db= require('../db/db');


// GET all professions
router.get('/', (req, res) => {
    db.query('SELECT * FROM Genero', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// POST add new profession
router.post('/', (req, res) => {
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
router.put('/:id', (req, res) => {
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
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Genero WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

module.exports=router;