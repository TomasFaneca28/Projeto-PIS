const express = require('express');
const router = express.Router();
const db= require('../db/db');

console.log("Entrou");

router.get('/:id', (req, res) => {
  const pessoaId = req.params.id;

  const query = `
    SELECT 
      p.id AS pessoaId,
      p.nome,
      p.photopath,
      p.dataNascimento,
      p.nacionalidade,
      f.id AS idFilme,
      f.nome AS tituloFilme,
      fp.papel,
      fp.elencoPrincipal,
      CASE 
        WHEN f.idDiretorPessoa = p.id THEN 1
        ELSE 0
      END AS isDiretor
    FROM Pessoa p
    LEFT JOIN FilmePessoa fp ON p.id = fp.idPessoa
    LEFT JOIN Filme f ON fp.idFilme = f.id OR f.idDiretorPessoa = p.id
    WHERE p.id = ?
    GROUP BY f.id, fp.papel, fp.elencoPrincipal
  `;

  db.query(query, [pessoaId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar pessoa e filmes' });
    if (results.length === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });

    // Extrair dados da pessoa (todos iguais)
    const pessoa = {
      id: results[0].pessoaId,
      nome: results[0].nome,
      photopath: results[0].photopath,
      dataNascimento: results[0].dataNascimento,
      nacionalidade: results[0].nacionalidade
    };

    // Extrair filmes (pode ser vazio)
    const filmes = results
      .filter(r => r.idFilme !== null)
      .map(r => ({
        idFilme: r.idFilme,
        titulo: r.nome,
        papel: r.isDiretor == 1 ? 'Diretor' : (r.papel || 'Ator/Atriz'),
        elencoPrincipal: r.elencoPrincipal,
        isDiretor: r.isDiretor == 1
      }));

    res.json({ pessoa, filmes });
  });
});

module.exports = router;