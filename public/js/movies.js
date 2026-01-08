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

function editMovie() {
    openMovieDialog();
}

function deleteMovie() {
    if (confirm('Eliminar este filme?')) {
        alert('Remover via JS depois');
    }
}

async function loadMovies() {
    try {
        const res = await fetch('/api/movies');
        const movies = await res.json();

        const container = document.getElementById('moviesGrid');
        container.innerHTML = '';

        movies.forEach(movie => {
            const poster = movie.posterPath
                ? `https://image.tmdb.org/t/p/w300${movie.posterPath}`
                : '/img/no-poster.png';

            container.innerHTML += `
        <div class="card border-blue-100 hover:shadow-lg transition-shadow">
          <img src="${poster}" style="width:30%; border-radius:8px">

          <div class="card-content space-y-2">
            <h3 class="text-blue-900">${movie.nome}</h3>
            <p class="text-xs text-gray-500">
              ${movie.DataLancamento?.substring(0, 4) ?? ''}
            </p>
          </div>
          <div class="actions">
            <button class="btn outline" onclick="editMovie(${movie.id})">Editar</button>
            <button class="btn outline" onclick="">Eliminar</button>
          </div>
        </div>`;
        });

    } catch (err) {
        console.error('Erro ao carregar filmes', err);
    }
}

function editMovie(id) {
    fetch(`${apiMovies}/${id}`)
        .then(res => res.json())
        .then(p => {
            editingPersonId = p.id;
            document.getElementById('personName').value = p.name;
            professionSelect.value = p.professionId;
            personForm.classList.remove('hidden');
        });
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
    if (!res.ok) throw new Error('Erro na importação');
    closeMovieDialog();
    loadMovies();
  } catch (err) {
    console.error(err);
    alert('⚠️ Filme já existe na BD');
  }
}
loadMovies();
