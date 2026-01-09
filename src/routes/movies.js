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

router.get('/stats/overview', async (req, res) => {
  try {
    // Contar filmes
    const filmesCount = await query(
      "SELECT COUNT(*) as total FROM Filme WHERE tipo = 'FILME'"
    );

    // Contar séries
    const seriesCount = await query(
      "SELECT COUNT(*) as total FROM Filme WHERE tipo = 'SERIE'"
    );

    // Contar atores
    const atoresCount = await query(
      `SELECT COUNT(DISTINCT p.id) as total 
       FROM Pessoa p 
       JOIN TipoProfissao tp ON p.tipo = tp.id 
       WHERE tp.tipo = 'Ator'`
    );

    // Contar diretores
    const diretoresCount = await query(
      `SELECT COUNT(DISTINCT p.id) as total 
       FROM Pessoa p 
       JOIN TipoProfissao tp ON p.tipo = tp.id 
       WHERE tp.tipo = 'Diretor'`
    );

    // Contar géneros
    const generosCount = await query('SELECT COUNT(*) as total FROM Genero');

    // Contar reviews
    const reviewsCount = await query('SELECT COUNT(*) as total FROM Review');

    // Filmes/Séries recentes (últimos 10)
    const recentMovies = await query(
      `SELECT 
        id, 
        nome, 
        tipo, 
        posterPath, 
        DataLancamento,
        DATE_FORMAT(DataLancamento, '%d/%m/%Y') as dataFormatada
       FROM Filme 
       ORDER BY DataLancamento DESC 
       LIMIT 10`
    );

    // Reviews recentes (últimas 10)
    const recentReviews = await query(
      `SELECT 
        r.id,
        r.avaliacao,
        r.critica,
        r.dataReview,
        DATE_FORMAT(r.dataReview, '%d/%m/%Y %H:%i') as dataFormatada,
        u.username,
        f.nome as filmeNome,
        f.id as filmeId
       FROM Review r
       JOIN Utilizador u ON r.idUtilizador = u.id
       JOIN Filme f ON r.idFilme = f.id
       ORDER BY r.dataReview DESC
       LIMIT 10`
    );

    res.json({
      stats: {
        filmes: filmesCount[0].total,
        series: seriesCount[0].total,
        atores: atoresCount[0].total,
        diretores: diretoresCount[0].total,
        generos: generosCount[0].total,
        reviews: reviewsCount[0].total
      },
      recentMovies,
      recentReviews
    });

  } catch (err) {
    console.error('Erro ao buscar estatísticas:', err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// GET /api/movies/filter - Filtrar filmes por nome, tipo e género
router.get('/filter/search', async (req, res) => {
  try {
    const { nome, tipo, genero } = req.query;
    
    let sql = `
      SELECT DISTINCT f.*
      FROM Filme f
      LEFT JOIN FilmeGenero fg ON f.id = fg.idFilme
      LEFT JOIN Genero g ON fg.idGenero = g.id
      WHERE 1=1
    `;
    
    const params = [];

    // Filtro por nome
    if (nome && nome.trim() !== '') {
      sql += ' AND f.nome LIKE ?';
      params.push(`%${nome}%`);
    }

    // Filtro por tipo (FILME ou SERIE)
    if (tipo && tipo !== 'TODOS') {
      sql += ' AND f.tipo = ?';
      params.push(tipo);
    }

    // Filtro por género
    if (genero && genero !== 'TODOS') {
      sql += ' AND g.id = ?';
      params.push(genero);
    }

    sql += ' ORDER BY f.DataLancamento DESC';

    console.log('🔍 Query de filtro:', sql);
    console.log('📋 Parâmetros:', params);

    const filmes = await query(sql, params);
    
    res.json(filmes);

  } catch (err) {
    res.status(500).json({ error: 'Erro ao filtrar filmes' });
  }
});
router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM Filme');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar filmes:', err);
    res.status(500).json({ error: 'Erro ao listar filmes' });
  }
});

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

    // Buscar elenco
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

router.post('/import/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const type = req.query.type === 'tv' ? 'SERIE' : 'FILME';

  try {
    const data = type === 'FILME'
      ? await tmdbService.getMovieDetails(id)
      : await tmdbService.getSerieDetails(id);

    // Verificar se já existe ANTES de importar
    const existingCheck = await query(
        `SELECT id FROM Filme 
         WHERE nome = ? AND DataLancamento = ? AND tipo = ?`,
        [data.title || data.name, data.release_date || data.first_air_date, type]
    );

    if (existingCheck.length > 0) {
        return res.status(400).json({ 
            error: 'Este filme/série já foi importado',
            filmeId: existingCheck[0].id 
        });
    }

    // PEGI default
    const pegiId = await getOrCreatePegi(12);

    // DIRETOR / CRIADOR
    let diretorId = null;

    if (type === 'FILME') {
      // Para filmes, procurar "Director" nos créditos
      const crew = data.credits?.crew || [];
      const director = crew.find(p => p.job === 'Director');
      
      if (director) {
        diretorId = await getOrCreatePessoa(director.id, 'Diretor', TMDB_KEY);
      }
    } else {
      // Para séries, usar "created_by" (criadores)
      if (data.created_by && data.created_by.length > 0) {
        const creator = data.created_by[0];
        diretorId = await getOrCreatePessoa(creator.id, 'Diretor', TMDB_KEY);
      } else {
        // Fallback: procurar "Executive Producer" nos créditos
        const crew = data.credits?.crew || [];
        const execProducer = crew.find(p => p.job === 'Executive Producer');
        
        if (execProducer) {
          diretorId = await getOrCreatePessoa(execProducer.id, 'Diretor', TMDB_KEY);
        }
      }
    }

    // FILME / SÉRIE
    const filmeId = await insertFilme({
      nome: data.title || data.name,
      dataLancamento: data.release_date || data.first_air_date,
      tipo: type,
      poster: data.poster_path,
      sinopse: data.overview,
      duracao: data.runtime || data.episode_run_time?.[0] || null,
      pegi: pegiId,
      diretor: diretorId // Pode ser null
    });

    // GÉNEROS
    for (const g of data.genres || []) {
      const generoId = await getOrCreateGenero(g.name);
      await linkFilmeGenero(filmeId, generoId);
    }

    // ATORES (TOP 5)
    const cast = data.credits?.cast || [];
    for (const actor of cast.slice(0, 5)) {
      const pessoaId = await getOrCreatePessoa(actor.id, 'Ator', TMDB_KEY);
      await linkFilmePessoa(filmeId, pessoaId, actor.character || 'Ator', actor.order < 3);
    }

    res.json({ 
      success: true,
      filmeId,
      message: `${type === 'FILME' ? 'Filme' : 'Série'} importado com sucesso!`
    });

  } catch (err) {
    console.error('❌ Erro ao importar:', err);
    res.status(500).json({ 
      error: 'Erro ao importar TMDB',
      details: err.message 
    });
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
      message: `${filme.nome} foi eliminado com sucesso!`
    });

  } catch (err) {
    console.error('Erro ao eliminar filme:', err);
    res.status(500).json({
      error: 'Erro ao eliminar filme',
      details: err.message
    });
  }
});

module.exports = router;