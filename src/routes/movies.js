const express = require('express');
const { promisify } = require('util');
const router = express.Router();
const tmdbService = require('../services/tmdbServices');
const db = require('../db/db');
const requireAdmin = require('../middleware/requireAdmin');
const query = promisify(db.query).bind(db);
const TMDB_KEY = process.env.TMDB_API_KEY;
const {
  getOrCreatePegi,
  getOrCreatePessoa,
  getOrCreateGenero,
  linkFilmeGenero,
  linkFilmePessoa,
  insertFilme
} = require('../services/importHelpers.js');

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar informações do filme
    const filmeRows = await query(`
      SELECT 
        f.*,
        p.tipo as pegiTipo,
        diretor.nome as diretorNome,
        diretor.photopath as diretorPhoto
      FROM Filme f
      LEFT JOIN Pegi p ON f.idPegi = p.id
      LEFT JOIN Pessoa diretor ON f.idDiretorPessoa = diretor.id
      WHERE f.id = ?
    `, [id]);

    if (filmeRows.length === 0) {
      return res.status(404).json({ error: 'Filme não encontrado' });
    }

    const filme = filmeRows[0];

    // Buscar géneros do filme
    const generos = await query(`
      SELECT g.nome
      FROM FilmeGenero fg
      JOIN Genero g ON fg.idGenero = g.id
      WHERE fg.idFilme = ?
    `, [id]);

    // Buscar elenco (atores e equipe)
    const elenco = await query(`
      SELECT 
        p.id,
        p.nome,
        p.photopath,
        fp.papel,
        fp.elencoPrincipal,
        tp.tipo as profissao
      FROM FilmePessoa fp
      JOIN Pessoa p ON fp.idPessoa = p.id
      JOIN TipoProfissao tp ON p.tipo = tp.id
      WHERE fp.idFilme = ?
      ORDER BY fp.elencoPrincipal DESC, p.nome
    `, [id]);

    // Buscar reviews
    const reviews = await query(`
      SELECT 
        r.*,
        u.username
      FROM Review r
      JOIN Utilizador u ON r.idUtilizador = u.id
      WHERE r.idFilme = ?
      ORDER BY r.dataReview DESC
    `, [id]);

    // Calcular média de avaliações
    let mediaAvaliacao = 0;
    if (reviews.length > 0) {
      const soma = reviews.reduce((acc, r) => acc + r.avaliacao, 0);
      mediaAvaliacao = (soma / reviews.length).toFixed(1);
    }

    res.json({
      filme,
      generos: generos.map(g => g.nome),
      elenco,
      reviews,
      mediaAvaliacao
    });

  } catch (err) {
    console.error('Erro ao obter detalhes do filme:', err);
    res.status(500).json({ error: 'Erro ao obter detalhes do filme' });
  }
});

router.get('/', async (req, res) => {
  const [rows] = await db.promise().query('SELECT * FROM Filme');
  res.json(rows);
});

// POST /api/movies/import/:id?type=movie|tv
router.post('/import/:id', requireAdmin, async (req, res) => {
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

router.delete('/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const filmeCheck = await query('SELECT * FROM Filme WHERE id = ?', [id]);

        if (filmeCheck.length === 0) {
            return res.status(404).json({ error: 'Filme não encontrado' });
        }

        const filme = filmeCheck[0];

        await query('DELETE FROM Review WHERE idFilme = ?', [id]);
        console.log('🗑️ Reviews eliminadas');

        await query('DELETE FROM Favorito WHERE idFilme = ?', [id]);
        console.log('🗑️ Favoritos eliminados');

        await query('DELETE FROM FilmeGenero WHERE idFilme = ?', [id]);
        console.log('🗑️ Géneros desvinculados');

        await query('DELETE FROM FilmePessoa WHERE idFilme = ?', [id]);
        console.log('🗑️ Atores desvinculados');

        await query('DELETE FROM Filme WHERE id = ?', [id]);
        console.log('✅ Filme eliminado:', filme.nome);

        res.json({
            success: true,
        });

    } catch (err) {
        console.error('❌ Erro ao eliminar filme:', err);
        res.status(500).json({
            error: 'Erro ao eliminar filme',
            details: err.message
        });
    }
});

module.exports = router;
