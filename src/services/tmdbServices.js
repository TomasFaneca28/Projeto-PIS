const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

if (!API_KEY) {
  console.error("❌ ERRO: TMDB_API_KEY não definida no tmdbServices.js");
  console.error("Valor atual:", API_KEY);
}

const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'pt-PT'
  }
});

// Pesquisa de filmes/séries
async function searchMulti(query) {
  const response = await tmdb.get('/search/multi', {
    params: { query }
  });
  return response.data.results;
}

// Detalhes de um filme ou série
async function getMovieDetails(id, type = 'movie') {
  // type pode ser 'movie' ou 'tv'
  const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
  const response = await tmdb.get(endpoint, {
    params: { append_to_response: 'credits,videos' }
  });
  return response.data;
}

async function getMovieDetails(movieId) {
  console.log('Fetching movie ID:', movieId);
  const response = await tmdb.get(`/movie/${movieId}`, {
    params: { append_to_response: 'credits,videos' }
  });
  console.log('TMDB response:', response.data);
  return response.data;
}

async function getSerieDetails(id) {
  const response = await tmdb.get(`/tv/${id}`, {
    params: { append_to_response: 'credits' }
  });
  return response.data;
}

module.exports = {
  getMovieDetails,
  getSerieDetails,
  searchMulti
};