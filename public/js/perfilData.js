// Carrega favoritos do utilizador
const loadFavoritos = async () => {
  const favoritosContainer = document.getElementById('favoritos-container');
  
  if (!favoritosContainer) {
    console.warn('Elemento #favoritos-container não encontrado');
    return;
  }

  try {
    const response = await fetch('/api/favoritos');
    const favoritos = await response.json();

    if (!response.ok) {
      console.error('Erro ao carregar favoritos:', favoritos.error);
      favoritosContainer.innerHTML = '<p>Erro ao carregar favoritos</p>';
      return;
    }

    if (favoritos.length === 0) {
      favoritosContainer.innerHTML = '<p>Nenhum filme favorito ainda</p>';
      return;
    }

    let html = '<ul>';
    favoritos.forEach(filme => {
      html += `
        <li>
          <strong>${filme.nome}</strong> (${filme.tipo})
          <br/>
          <small>Lançamento: ${new Date(filme.DataLancamento).toLocaleDateString('pt-PT')}</small>
        </li>
      `;
    });
    html += '</ul>';

    favoritosContainer.innerHTML = html;
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    favoritosContainer.innerHTML = '<p>Erro ao carregar favoritos</p>';
  }
};

// Carrega reviews do utilizador
const loadReviews = async () => {
  const reviewsContainer = document.getElementById('reviews-container');
  
  if (!reviewsContainer) {
    console.warn('Elemento #reviews-container não encontrado');
    return;
  }

  try {
    const response = await fetch('/api/reviews');
    const reviews = await response.json();

    if (!response.ok) {
      console.error('Erro ao carregar reviews:', reviews.error);
      reviewsContainer.innerHTML = '<p>Erro ao carregar reviews</p>';
      return;
    }

    if (reviews.length === 0) {
      reviewsContainer.innerHTML = '<p>Nenhuma review ainda</p>';
      return;
    }

    let html = '<ul>';
    reviews.forEach(review => {
      html += `
        <li>
          <strong>${review.filmeNome}</strong>
          <br/>
          <strong>Avaliação:</strong> ${review.avaliacao}/10
          <br/>
          <strong>Review:</strong> ${review.critica || 'Sem texto'}
          <br/>
          <small>Data: ${new Date(review.dataReview).toLocaleDateString('pt-PT')}</small>
          <br/>
          <small>Votos de utilidade: ${review.votosUtilidade || 0}</small>
        </li>
        <hr/>
      `;
    });
    html += '</ul>';

    reviewsContainer.innerHTML = html;
  } catch (error) {
    console.error('Erro ao buscar reviews:', error);
    reviewsContainer.innerHTML = '<p>Erro ao carregar reviews</p>';
  }
};

// Carrega todos os dados do perfil quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
  loadFavoritos();
  loadReviews();
});
