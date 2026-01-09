const apiMovies = '/api/movies';

// Função para formatar números grandes
function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num;
}

// Função para animar contadores
function animateCounter(element, target) {
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 20);
}

// Carregar estatísticas
async function loadStats() {
  try {
    const res = await fetch(`${apiMovies}/stats/overview`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    const { stats, recentMovies, recentReviews } = data;

    console.log('Estatísticas carregadas:', data);

    // Atualizar contadores com animação
    animateCounter(document.getElementById('moviesCount'), stats.filmes);
    animateCounter(document.getElementById('seriesCount'), stats.series);
    animateCounter(document.getElementById('actorsCount'), stats.atores);
    animateCounter(document.getElementById('directorsCount'), stats.diretores);
    animateCounter(document.getElementById('genresCount'), stats.generos);
    animateCounter(document.getElementById('reviewsCount'), stats.reviews);

    // Renderizar filmes/séries recentes
    renderRecentMovies(recentMovies);

    // Renderizar reviews recentes
    renderRecentReviews(recentReviews);

  } catch (err) {
    console.error('Erro ao carregar estatísticas:', err);
    
    // Mostrar 0 nos contadores em caso de erro
    ['moviesCount', 'seriesCount', 'actorsCount', 'directorsCount', 'genresCount', 'reviewsCount']
      .forEach(id => {
        document.getElementById(id).textContent = '0';
      });
    
    document.getElementById('recentMovies').innerHTML = 
      '<p class="text-gray-500 text-center">Erro ao carregar filmes recentes</p>';
    
    document.getElementById('recentReviews').innerHTML = 
      '<p class="text-gray-500 text-center">Erro ao carregar reviews recentes</p>';
  }
}

// Renderizar filmes/séries recentes
function renderRecentMovies(movies) {
  const container = document.getElementById('recentMovies');
  
  if (!movies || movies.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center">Nenhum filme adicionado ainda</p>';
    return;
  }

  container.innerHTML = movies.map(movie => {
    const poster = movie.posterPath
      ? `https://image.tmdb.org/t/p/w92${movie.posterPath}`
      : 'https://via.placeholder.com/92x138/cccccc/666666?text=Sem+Poster';

    const tipoIcon = movie.tipo === 'FILME' ? '🎬' : '📺';
    const tipoClass = movie.tipo === 'FILME' ? 'badge-filme' : 'badge-serie';

    return `
      <a href="/filmeDetails?id=${movie.id}" style="text-decoration: none; color: inherit;">
        <div class="flex items-start space-x-3 hover-card">
          <img 
            src="${poster}" 
            alt="${movie.nome}"
            class="poster-mini"
          />
          <div class="flex-1">
            <h3 class="text-blue-900 font-medium">${movie.nome}</h3>
            <p class="text-xs text-gray-500 mt-1">
              ${tipoIcon} ${movie.dataFormatada || 'Data desconhecida'}
            </p>
            <span class="badge ${tipoClass}">${movie.tipo}</span>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

// Renderizar reviews recentes
function renderRecentReviews(reviews) {
  const container = document.getElementById('recentReviews');
  
  if (!reviews || reviews.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center">Nenhuma review ainda</p>';
    return;
  }

  container.innerHTML = reviews.map(review => {
    // Criar estrelas baseado na avaliação (1-5)
    const stars = review.avaliacao;
    const starsHTML = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);

    // Truncar crítica se for muito longa
    const criticaPreview = review.critica 
      ? (review.critica.length > 100 
          ? review.critica.substring(0, 100) + '...' 
          : review.critica)
      : 'Sem comentário';

    return `
      <a href="/filmeDetails?id=${review.filmeId}" style="text-decoration: none; color: inherit;">
        <div class="review-card hover-card">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h4 class="text-blue-900 font-medium">${review.filmeNome}</h4>
              <p class="text-xs text-gray-500">por ${review.username}</p>
            </div>
            <div class="text-right">
              <div class="stars">${starsHTML}</div>
              <span class="text-xs text-gray-500">${review.avaliacao}/5</span>
            </div>
          </div>
          ${review.critica ? `
            <p class="text-sm text-gray-600 mt-2">${criticaPreview}</p>
          ` : ''}
          <p class="text-xs text-gray-400 mt-2">${review.dataFormatada}</p>
        </div>
      </a>
    `;
  }).join('');
}

// Carregar dados ao iniciar
loadStats();

// Opcional: Atualizar a cada 30 segundos
// setInterval(loadStats, 30000);