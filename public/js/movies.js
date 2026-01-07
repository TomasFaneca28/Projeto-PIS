const apiMovies = '/api/movies';

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

    loadMovies();
