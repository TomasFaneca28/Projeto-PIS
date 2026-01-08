const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbServices');
const db = require('../db/db');
const TMDB_KEY = process.env.TMDB_API_KEY;
const {
  getOrCreatePegi,
  getOrCreatePessoa,
  getOrCreateGenero,
  linkFilmeGenero,
  linkFilmePessoa,
  insertFilme
} = require('../services/importHelpers.js');

router.get('/', async (req, res) => {
  const [rows] = await db.promise().query('SELECT * FROM Filme');
  res.json(rows);
});

// POST /api/movies/import/:id?type=movie|tv
router.post('/import/:id', async (req, res) => {
  const { id } = req.params;
  const type = req.query.type === 'tv' ? 'SERIE' : 'FILME';

  try {
    const data = type === 'FILME'
      ? await tmdbService.getMovieDetails(id)
      : await tmdbService.getSerieDetails(id);

    // PEGI default
    const pegiId = await getOrCreatePegi(12);

    // DIRETOR / CRIADOR
    const crew = data.credits?.crew || [];
    const director = crew.find(p => p.job === 'Director');
    const diretorId = director
      ? await getOrCreatePessoa(director.id, 'Diretor', TMDB_KEY)
      : null;

    // FILME / SÉRIE
    const filmeId = await insertFilme({
      nome: data.title || data.name,
      dataLancamento: data.release_date || data.first_air_date,
      tipo: type,
      poster: data.poster_path,
      sinopse: data.overview,
      duracao: data.runtime || data.episode_run_time?.[0] || null,
      pegi: pegiId,
      diretor: diretorId
    });

    // GÉNEROS
    for (const g of data.genres) {
      const generoId = await getOrCreateGenero(g.name);
      await linkFilmeGenero(filmeId, generoId);
    }

    // ATORES (TOP 5)
    const cast = data.credits?.cast || [];
    for (const actor of cast.slice(0, 5)) {
      const pessoaId = await getOrCreatePessoa(actor.id, 'Ator', TMDB_KEY);
      await linkFilmePessoa(filmeId, pessoaId, actor.character, actor.order < 3);
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao importar TMDB' });
  }
});

module.exports = router;
