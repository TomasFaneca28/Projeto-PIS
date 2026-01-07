const express = require('express');
const router = express.Router();
const db = require('../db/db');
const tmdbService = require('../services/tmdbServices');

router.get('/', (req, res) => {  const query = `
    SELECT id, nome, posterPath, DataLancamento, tipo
    FROM Filme
    ORDER BY DataLancamento DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao obter filmes' });
    res.json(results);
  }); });

// POST /api/movies/import/:tmdbId?type=movie
router.post('/import/:tmdbId', async (req, res) => {
  const { tmdbId } = req.params;
  const type = req.query.type || 'movie'; // movie ou tv

  try {
    const movie = await tmdbService.getMovieDetails(tmdbId, type);

    const insertFilme = `
      INSERT INTO Filme
      (nome, idPegi, idDiretorPessoa, DataLancamento, tipo, posterPath, sinopse, duracao)
      VALUES (?, 1, 1, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertFilme,
      [
        movie.title || movie.name,
        movie.release_date || movie.first_air_date,
        type.toUpperCase(),
        movie.poster_path,
        movie.overview,
        movie.runtime || movie.episode_run_time?.[0] || 0
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao inserir filme' });
        }

        res.status(201).json({
          message: `${type === 'movie' ? 'Filme' : 'Série'} importado com sucesso`,
          filmeId: result.insertId
        });
      }
    );
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao importar da TMDB', details: err.response?.data || err.message });
  }
});

module.exports = router;
