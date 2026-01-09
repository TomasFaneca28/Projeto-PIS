const detalhes = document.getElementById('detalhes');
const apiMovies = '/api/movies';

const urlParams = new URLSearchParams(window.location.search);
const filmeID = urlParams.get('id');
let isFavorito = false;

async function loadFilme() {
  try {
    const res = await fetch(`${apiMovies}/${filmeID}`);
    const data = await res.json();
    const { filme, generos, elenco, reviews, mediaAvaliacao } = data;

    // Verificar se é favorito
    try {
      const favRes = await fetch(`/api/check-favorito/${filmeID}`);
      const favData = await favRes.json();
      isFavorito = favData.isFavorito;
    } catch (e) {
      console.log('Não autenticado ou erro ao verificar favorito');
    }

    const poster = filme.posterPath
      ? `https://image.tmdb.org/t/p/w500${filme.posterPath}`
      : 'https://via.placeholder.com/500x750/cccccc/666666?text=Sem+Poster';

    const dataLancamento = filme.DataLancamento
      ? new Date(filme.DataLancamento).toLocaleDateString('pt-PT')
      : 'Desconhecida';

    const duracao = filme.duracao 
      ? `${filme.duracao} minutos` 
      : 'N/A';

    // Separar elenco por tipo
    const atores = elenco.filter(e => e.profissao === 'Ator');
    const equipe = elenco.filter(e => e.profissao !== 'Ator');

    const botaoFavorito = `<button class="like-btn ${isFavorito ? 'favorito' : ''}" onclick="toggleFavorito()">${isFavorito ? '❤️' : '🤍'} ${isFavorito ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</button>`;

    detalhes.innerHTML = `
      <button class="back-btn" onclick="history.back()">← Voltar</button>

      <div class="filme-card">
        <div class="filme-header">
          <img src="${poster}" alt="${filme.nome}" class="poster"/>
          <div class="info">
            <h1>${filme.nome}</h1>
            <span class="badge-tipo">${filme.tipo}</span>
            ${botaoFavorito}
            
            <div class="details">
              <p>📅 <strong>Data de lançamento:</strong> ${dataLancamento}</p>
              <p>⏱️ <strong>Duração:</strong> ${duracao}</p>
              <p>🔞 <strong>PEGI:</strong> ${filme.pegiTipo || 'N/A'}</p>
              ${filme.diretorNome ? `<p>🎬 <strong>Diretor:</strong> ${filme.diretorNome}</p>` : ''}
              ${generos.length > 0 ? `<p>🎭 <strong>Géneros:</strong> ${generos.join(', ')}</p>` : ''}
              ${mediaAvaliacao > 0 ? `<p>⭐ <strong>Avaliação:</strong> ${mediaAvaliacao}/5 (${reviews.length} reviews)</p>` : ''}
            </div>

            ${filme.sinopese ? `
              <div class="sinopse">
                <h3>📖 Sinopse</h3>
                <p>${filme.sinopese}</p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      ${atores.length > 0 ? `
        <h2>🎭 Elenco Principal</h2>
        <div class="elenco-grid">
          ${atores.slice(0, 10).map(a => {
            const foto = a.photopath 
              ? `https://image.tmdb.org/t/p/w200${a.photopath}` 
              : 'https://via.placeholder.com/200x300/cccccc/666666?text=Sem+Foto';
            
            return `
              <a href="pessoaDetails?id=${a.id}">
                <div class="elenco-card">
                  <img src="${foto}" alt="${a.nome}"/>
                  <h4>${a.nome}</h4>
                  <p class="papel">${a.papel}</p>
                  ${a.elencoPrincipal ? '<span class="badge-principal">⭐ Principal</span>' : ''}
                </div>
              </a>
            `;
          }).join('')}
        </div>
      ` : ''}

      ${equipe.length > 0 ? `
        <h2>👥 Equipa</h2>
        <div class="equipe-list">
          ${equipe.map(e => `
            <div class="equipe-item">
              <strong>${e.nome}</strong> - ${e.papel}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${reviews.length > 0 ? `
        <h2>💬 Reviews (${reviews.length})</h2>
        <div class="reviews-list">
          ${reviews.map(r => {
            const dataReview = new Date(r.dataReview).toLocaleDateString('pt-PT');
            const estrelas = '★'.repeat(r.avaliacao) + '☆'.repeat(5 - r.avaliacao);
            return `
              <div class="review-card">
                <div class="review-header">
                  <div class="review-left">
                    <div class="review-icon">
                      <i class="fa-solid fa-user"></i>
                    </div>
                    <div>
                      <div class="review-title">${r.username}</div>
                      <span class="tag">${dataReview}</span>
                    </div>
                  </div>
                  <div class="review-rating">
                    ${estrelas}
                    <small>${r.avaliacao}/5</small>
                  </div>
                </div>
                ${r.critica ? `<div class="review-text">"${r.critica}"</div>` : ''}
                <div class="review-footer">
                  <div class="review-footer-left">
                    <div class="footer-item">
                      <i class="fa-solid fa-thumbs-up"></i> ${r.votosUtilidade || 0} úteis
                    </div>
                  </div>
                  <div class="review-footer-right">
                    <div class="footer-item footer-action" onclick="marcarUtil(${r.id})">
                      <i class="fa-solid fa-bookmark"></i> Marcar como útil
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      <!-- Formulário de criar review -->
      <div class="review-form-container">
        <h2>✍️ Escrever Review</h2>
        <form id="reviewForm" class="review-form">
          <div class="form-group">
            <label for="avaliacao">Avaliação (1-5):</label>
            <input type="number" id="avaliacao" name="avaliacao" min="1" max="5" required>
          </div>
          <div class="form-group">
            <label for="critica">Crítica:</label>
            <textarea id="critica" name="critica" rows="4" placeholder="Escreva a sua opinião sobre este filme..."></textarea>
          </div>
          <button type="submit" class="btn-submit">Publicar Review</button>
        </form>
        <div id="reviewMessage"></div>
      </div>
    `;

    // Event listener para o formulário de review
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await criarReview();
      });
    }
  } catch (err) {
    console.error(err);
    detalhes.innerHTML = '<div class="error"><p>Erro ao carregar os dados do filme.</p></div>';
  }
}

loadFilme();

// Função para criar review
async function criarReview() {
  const avaliacao = document.getElementById('avaliacao').value;
  const critica = document.getElementById('critica').value;
  const messageDiv = document.getElementById('reviewMessage');

  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filmeId: filmeID,
        avaliacao: parseInt(avaliacao),
        critica: critica
      })
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.style.background = '#4caf50';
      messageDiv.style.color = '#fff';
      messageDiv.style.padding = '10px';
      messageDiv.style.borderRadius = '4px';
      messageDiv.textContent = 'Review publicada com sucesso!';
      messageDiv.style.display = 'block';
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      messageDiv.style.background = '#f44336';
      messageDiv.style.color = '#fff';
      messageDiv.style.padding = '10px';
      messageDiv.style.borderRadius = '4px';
      messageDiv.textContent =  (data.error || 'Erro ao publicar review');
      messageDiv.style.display = 'block';
    }
  } catch (error) {
    messageDiv.style.background = '#f44336';
    messageDiv.style.color = '#fff';
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.textContent = 'Erro ao conectar ao servidor';
    messageDiv.style.display = 'block';
  }
}

// Função para marcar review como útil
async function marcarUtil(reviewId) {
  try {
    const response = await fetch(`/api/reviews/${reviewId}/util`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (response.ok) {
      alert('Review marcada como útil!');
      window.location.reload();
    } else {
      alert((data.error || 'Erro ao marcar como útil'));
    }
  } catch (error) {
    alert('Erro ao conectar ao servidor');
  }
}

// Função para adicionar/remover dos favoritos
async function toggleFavorito() {
  try {
    const response = await fetch(`/api/favoritos/${filmeID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (response.ok) {
      isFavorito = data.isFavorito;
      const btn = document.querySelector('.like-btn');
      if (btn) {
        btn.textContent = isFavorito ? '❤️ Remover dos Favoritos' : '🤍 Adicionar aos Favoritos';
        btn.classList.toggle('favorito');
      }
      alert(data.message);
    } else {
      if (data.error === 'É necessário estar autenticado') {
        alert('É necessário estar autenticado para adicionar aos favoritos');
        window.location.href = '/login';
      } else {
        alert(data.error || 'Erro ao adicionar/remover favorito');
      }
    }
  } catch (error) {
    alert('Erro ao conectar ao servidor');
  }
}
