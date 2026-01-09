const express = require('express');
const axios = require('axios');
const router = express.Router();

const TMDB_KEY = process.env.TMDB_API_KEY;

if (!TMDB_KEY) {
  console.error("❌ ERRO: TMDB_API_KEY não definida. Confirma o .env!");
  process.exit(1);
}

router.get('/search', async (req, res) => {
  const { query, type } = req.query; // type = 'movie' ou 'tv'

  if (!query) {
    return res.status(400).json({ error: 'Query é obrigatória' });
  }

  try {
    // Determinar o endpoint baseado no tipo
    const endpoint = type === 'tv' 
      ? 'https://api.themoviedb.org/3/search/tv'
      : 'https://api.themoviedb.org/3/search/movie';

    const r = await axios.get(endpoint, {
      params: { 
        api_key: TMDB_KEY, 
        query, 
        language: 'pt-PT' 
      }
    });

    console.log(`🔍 Pesquisa TMDB [${type || 'movie'}]:`, query, '→', r.data.results.length, 'resultados');
    
    res.json(r.data.results);
  } catch (err) {
    console.error('Erro na pesquisa TMDB:', err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao pesquisar TMDB' });
  }
});

module.exports = router;
