const detalhes = document.getElementById('detalhes');
const apiPeopleMovie = '/api/pessoasFilme';

const urlParams = new URLSearchParams(window.location.search);
const pessoaID = urlParams.get('id');

async function loadPerson() {
  try {
    const res = await fetch(`${apiPeopleMovie}/${pessoaID}`);
    const data = await res.json();
    const { pessoa, filmes } = data;

    const avatar = pessoa.photopath 
      ? `https://image.tmdb.org/t/p/w500${pessoa.photopath}` 
      : 'logo.svg';

    const dataNascimento = pessoa.dataNascimento 
      ? new Date(pessoa.dataNascimento).toLocaleDateString('pt-PT')
      : 'Desconhecida';

    // Separar filmes por tipo
    const filmesComoDiretor = filmes.filter(f => f.isDiretor);
    const filmesComoAtor = filmes.filter(f => !f.isDiretor);

    detalhes.innerHTML = `
      <button class="back-btn" onclick="history.back()">← Voltar</button>

      <div class="person-card">
        <div class="person-header">
          <img src="${avatar}" alt="${pessoa.nome}" class="avatar"/>
          <div class="info">
            <h1>${pessoa.nome}</h1>
            <div class="details">
              <p>📅 <strong>Data de nascimento:</strong> ${dataNascimento}</p>
              <p>🌍 <strong>Nacionalidade:</strong> ${pessoa.nacionalidade || 'Desconhecida'}</p>
            </div>
          </div>
        </div>
      </div>

      ${filmesComoDiretor.length > 0 ? `
        <h2>🎬 Filmes como Diretor(a)</h2>
        <div class="movies-list">
          ${filmesComoDiretor.map(f => `
            <a href="filme.html?id=${f.idFilme}">
              <div class="movie-card">
                <h3>🎥 ${f.titulo}</h3>
                <p><strong>Papel:</strong> ${f.papel}</p>
                <span class="badge-principal">🎬 Diretor(a)</span>
              </div>
            </a>
          `).join('')}
        </div>
      ` : ''}

      ${filmesComoAtor.length > 0 ? `
        <h2>🎭 Filmes como Ator/Atriz</h2>
        <div class="movies-list">
          ${filmesComoAtor.map(f => `
            <a href="filme.html?id=${f.idFilme}">
              <div class="movie-card">
                <h3>${f.titulo}</h3>
                <p><strong>Papel:</strong> ${f.papel}</p>
                ${f.elencoPrincipal ? '<span class="badge-principal">⭐ Elenco Principal</span>' : ''}
              </div>
            </a>
          `).join('')}
        </div>
      ` : ''}

      ${filmes.length === 0 ? `
        <div class="no-movies">
          <p>Nenhum filme encontrado.</p>
        </div>
      ` : ''}
    `;
  } catch (err) {
    console.error(err);
    detalhes.innerHTML = '<div class="no-movies"><p>Erro ao carregar os dados.</p></div>';
  }
}

loadPerson();