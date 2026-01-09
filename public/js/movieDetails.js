const detalhes = document.getElementById('detalhes');
const apiMovies = '/api/movies';

const urlParams = new URLSearchParams(window.location.search);
const filmeID = urlParams.get('id');

async function loadFilme() {
  try {
    const res = await fetch(`${apiMovies}/${filmeID}`);
    const data = await res.json();
    const { filme, generos, elenco, reviews, mediaAvaliacao } = data;

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

    detalhes.innerHTML = `
      <button class="back-btn" onclick="history.back()">← Voltar</button>

      <div class="filme-card">
        <div class="filme-header">
          <img src="${poster}" alt="${filme.nome}" class="poster"/>
          <div class="info">
            <h1>${filme.nome}</h1>
            <span class="badge-tipo">${filme.tipo}</span>
            
            <div class="details">
              <p>📅 <strong>Data de lançamento:</strong> ${dataLancamento}</p>
              <p>⏱️ <strong>Duração:</strong> ${duracao}</p>
              <p>🔞 <strong>PEGI:</strong> ${filme.pegiTipo || 'N/A'}</p>
              ${filme.diretorNome ? `<p>🎬 <strong>Diretor:</strong> ${filme.diretorNome}</p>` : ''}
              ${generos.length > 0 ? `<p>🎭 <strong>Géneros:</strong> ${generos.join(', ')}</p>` : ''}
              ${mediaAvaliacao > 0 ? `<p>⭐ <strong>Avaliação:</strong> ${mediaAvaliacao}/10 (${reviews.length} reviews)</p>` : ''}
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
        <h2>👥 Equipe</h2>
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
            return `
              <div class="review-card">
                <div class="review-header">
                  <strong>${r.username}</strong>
                  <span class="avaliacao">⭐ ${r.avaliacao}/10</span>
                </div>
                <p class="review-date">${dataReview}</p>
                ${r.critica ? `<p class="review-text">${r.critica}</p>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="no-reviews">
          <p>Nenhuma review ainda. Seja o primeiro a avaliar!</p>
        </div>
      `}
    `;
  } catch (err) {
    console.error(err);
    detalhes.innerHTML = '<div class="error"><p>Erro ao carregar os dados do filme.</p></div>';
  }
}

loadFilme();