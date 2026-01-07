const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbServices');

// GET /api/tmdb/search?q=batman
router.get('/search', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Parâmetro de pesquisa em falta' });
  }

  try {
    const results = await tmdbService.searchMulti(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao pesquisar na API externa' });
  }
});

// GET /api/tmdb/movie/:id
router.get('/movie/:id', async (req, res) => {
  try {
    const movie = await tmdbService.getMovieDetails(req.params.id);
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter detalhes do filme' });
  }
});

module.exports = router;
