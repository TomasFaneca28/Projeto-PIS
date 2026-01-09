const apiMovies = '/api/movies';
const searchInput = document.getElementById('searchInput');
const results = document.getElementById('results');

function openMovieDialog() {
    document.getElementById('movieDialog').style.display = 'flex';
}

function closeMovieDialog() {
    document.getElementById('movieDialog').style.display = 'none';
}

function openReviewDialog() {
    document.getElementById('reviewDialog').style.display = 'flex';
}

function closeReviewDialog() {
    document.getElementById('reviewDialog').style.display = 'none';
}

async function deleteMovie(id, nome) {
    // Confirmar antes de eliminar
    if (!confirm(`Tem certeza que deseja eliminar "${nome}"?`)) {
        return;
    }

    try {
        const res = await fetch(`${apiMovies}/${id}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        if (res.status === 403) {
            alert('Apenas administradores podem eliminar filmes');
            return;
        }

        if (!res.ok) {
            throw new Error(data.error || 'Erro ao eliminar filme');
        }

        alert('✅ ' + data.message);
        loadMovies(); // Recarregar a lista

    } catch (err) {
        console.error('Erro ao eliminar:', err);
        alert('Erro ao eliminar filme: ' + err.message);
    }
}

async function loadMovies() {
    try {
        console.log('A carregar filmes...');
        const res = await fetch('/api/movies');
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const movies = await res.json();
        console.log('Filmes carregados:', movies);

        const container = document.getElementById('moviesGrid');
        container.innerHTML = '';

        if (!Array.isArray(movies) || movies.length === 0) {
            container.innerHTML = '<p style="color: white; text-align: center;">Nenhum filme encontrado.</p>';
            return;
        }

        movies.forEach(movie => {
            const poster = movie.posterPath
                ? `https://image.tmdb.org/t/p/w300${movie.posterPath}`
                : 'https://via.placeholder.com/300x450/cccccc/666666?text=Sem+Poster';

            container.innerHTML += `
        <div class="card border-blue-100 hover:shadow-lg transition-shadow">
          <a href="filmeDetails?id=${movie.id}" style="text-decoration: none; color: inherit;">
            <img src="${poster}" style="width:100%; border-radius:8px" alt="${movie.nome}">
            <div class="card-content space-y-2">
              <h3 class="text-blue-900">${movie.nome}</h3>
              <p class="text-xs text-gray-500">
                ${movie.DataLancamento?.substring(0, 4) ?? ''}
              </p>
              <span class="badge">${movie.tipo}</span>
            </div>
          </a>
          <div class="actions">
            <button class="btn outline" onclick="event.stopPropagation(); deleteMovie(${movie.id}, '${movie.nome.replace(/'/g, "\\'")}')">Eliminar</button>
          </div>
        </div>`;
        });

    } catch (err) {
        console.error('Erro ao carregar filmes:', err);
        const container = document.getElementById('moviesGrid');
        container.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar filmes. Verifica a consola.</p>';
    }
}

function searchMovie() {
    const q = searchInput.value.trim();
    if (!q) return;

    fetch(`/api/tmdb/search?query=${encodeURIComponent(q)}&type=movie`)
        .then(res => res.json())
        .then(movies => {
            results.innerHTML = '';
            if (!Array.isArray(movies)) {
                results.innerHTML = '<p class="text-red-500">Erro: dados inválidos</p>';
                return;
            }
            movies.forEach(m => {
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
          <h3>${m.title}</h3>
          <p>${m.release_date || ''}</p>
          <button class="btn-primary" onclick="importFromTMDB(${m.id}, 'FILME')">
            Importar
          </button>
        `;
                results.appendChild(div);
            });
        })
        .catch(err => {
            console.error(err);
            results.innerHTML = '<p class="text-red-500">Erro ao pesquisar filmes</p>';
        });
}

function searchSerie() {
    const q = searchInput.value.trim();
    if (!q) return;

    fetch(`/api/tmdb/search?query=${encodeURIComponent(q)}&type=tv`)
        .then(res => res.json())
        .then(movies => {
            results.innerHTML = '';
            if (!Array.isArray(movies)) {
                results.innerHTML = '<p class="text-red-500">Erro: dados inválidos</p>';
                return;
            }
            movies.forEach(m => {
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
          <h3>${m.title}</h3>
          <p>${m.release_date || ''}</p>
          <button class="btn-primary" onclick="importFromTMDB(${m.id}, 'SERIE')">
            Importar
          </button>
        `;
                results.appendChild(div);
            });
        })
        .catch(err => {
            console.error(err);
            results.innerHTML = '<p class="text-red-500">Erro ao pesquisar filmes</p>';
        });
}

async function importFromTMDB(id, type) {
    try {
        const res = await fetch(`/api/movies/import/${id}?type=${type}`, {
            method: 'POST'
        });
        
        if (res.status === 403) {
            alert('Apenas administradores podem importar filmes');
            return;
        }
        
        if (!res.ok) throw new Error('Erro na importação');
        closeMovieDialog();
        loadMovies();
    } catch (err) {
        console.error(err);
        alert('O filme já existe na BD');
    }
}

function searchByType() {
    const type = document.getElementById('movieType').value;
    if (type === 'FILME') {
        searchMovie();
    } else {
        searchSerie();
    }
}

loadMovies();

// Verificar tipo de utilizador e esconder botão de adicionar para normais
async function checkUserPermissions() {
  try {
    const userRes = await fetch("/api/user-info");
    const userData = await userRes.json();
    
    if (userData.tipoUtilizador && userData.tipoUtilizador !== 2) {
      // Utilizador normal - esconder botão de adicionar
      const addBtn = document.querySelector('button[onclick="openMovieDialog()"]');
      if (addBtn) addBtn.style.display = 'none';
    }
  } catch (err) {
    console.log('Erro ao verificar permissões');
  }
}

checkUserPermissions();
