const apiMovies = '/api/movies';
const searchInput = document.getElementById('searchInput');
const results = document.getElementById('results');
const movieTypeSelect = document.getElementById('movieType');

// Elementos de filtro
const searchFilmes = document.getElementById('searchFilmes');
const filterTipo = document.getElementById('filterTipo');
const filterGenero = document.getElementById('filterGenero');

function openMovieDialog() {
    document.getElementById('movieDialog').style.display = 'flex';
    results.innerHTML = '<p class="text-sm text-gray-400">Pesquisa um filme ou série para ver resultados</p>';
    searchInput.value = '';
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
        applyFilters(); // Recarregar com filtros aplicados

    } catch (err) {
        console.error('Erro ao eliminar:', err);
        alert('Erro ao eliminar filme: ' + err.message);
    }
}

// CARREGAR GÉNEROS NA COMBOBOX
async function loadGeneros() {
    try {
        const res = await fetch('/api/genero');
        const generos = await res.json();
        
        const select = document.getElementById('filterGenero');
        
        generos.forEach(g => {
            const option = document.createElement('option');
            option.value = g.id;
            option.textContent = g.nome;
            select.appendChild(option);
        });

    } catch (err) {
        console.error('Erro ao carregar géneros:', err);
    }
}

// APLICAR FILTROS
async function applyFilters() {
    try {
        const nome = searchFilmes.value.trim();
        const tipo = filterTipo.value;
        const genero = filterGenero.value;

        // Construir query string
        const params = new URLSearchParams();
        if (nome) params.append('nome', nome);
        if (tipo) params.append('tipo', tipo);
        if (genero) params.append('genero', genero);

        console.log('🔍 Aplicando filtros:', { nome, tipo, genero });

        const res = await fetch(`/api/movies/filter/search?${params.toString()}`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const movies = await res.json();
        console.log('✅ Filmes filtrados:', movies.length);

        renderMovies(movies);

    } catch (err) {
        console.error('❌ Erro ao aplicar filtros:', err);
        const container = document.getElementById('moviesGrid');
        container.innerHTML = '<p style="color: red; text-align: center;">Erro ao filtrar filmes.</p>';
    }
}

// RENDERIZAR FILMES
function renderMovies(movies) {
    const container = document.getElementById('moviesGrid');
    container.innerHTML = '';

    if (!Array.isArray(movies) || movies.length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Nenhum filme encontrado com esses filtros.</p>';
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
}

// LIMPAR FILTROS
function clearFilters() {
    searchFilmes.value = '';
    filterTipo.value = 'TODOS';
    filterGenero.value = 'TODOS';
    applyFilters();
}

// CARREGAR TODOS OS FILMES (inicial)
async function loadMovies() {
    applyFilters(); // Usar a função de filtros sem parâmetros
}

// FUNÇÃO DE PESQUISA TMDB
function searchByType() {
    const q = searchInput.value.trim();
    const selectedType = movieTypeSelect.value;
    
    if (!q) {
        alert('Por favor, digite algo para pesquisar');
        return;
    }

    const tmdbType = selectedType === 'SERIE' ? 'tv' : 'movie';
    
    console.log(`🔍 Pesquisando ${selectedType}:`, q);

    fetch(`/api/tmdb/search?query=${encodeURIComponent(q)}&type=${tmdbType}`)
        .then(res => res.json())
        .then(items => {
            results.innerHTML = '';
            
            if (!Array.isArray(items)) {
                results.innerHTML = '<p class="text-red-500">Erro: dados inválidos</p>';
                return;
            }

            if (items.length === 0) {
                results.innerHTML = `<p class="text-gray-500">Nenhum ${selectedType.toLowerCase()} encontrado para "${q}"</p>`;
                return;
            }

            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'card';
                
                const titulo = item.title || item.name;
                const data = item.release_date || item.first_air_date || '';
                const poster = item.poster_path 
                    ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                    : '';

                div.innerHTML = `
                    <div style="display: flex; gap: 1rem; align-items: start;">
                        ${poster ? `<img src="${poster}" style="width: 60px; border-radius: 4px;">` : ''}
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 0.5rem 0;">${titulo}</h3>
                            <p style="margin: 0; color: #666; font-size: 0.9rem;">${data}</p>
                            <button 
                                class="btn-primary" 
                                style="margin-top: 0.75rem;"
                                onclick="importFromTMDB(${item.id}, '${tmdbType}')">
                                ➕ Importar
                            </button>
                        </div>
                    </div>
                `;
                results.appendChild(div);
            });
        })
        .catch(err => {
            console.error(err);
            results.innerHTML = '<p class="text-red-500">Erro ao pesquisar. Verifica a consola.</p>';
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
        
        const data = await res.json();
        
        if (!res.ok) {
            if (res.status === 400) {
                alert('⚠️ ' + data.error);
            } else {
                throw new Error(data.error || 'Erro na importação');
            }
            return;
        }
        
        alert('✅ ' + data.message);
        closeMovieDialog();
        applyFilters(); // Recarregar com filtros
    } catch (err) {
        console.error(err);
        alert('❌ Erro ao importar: ' + err.message);
    }
}

// Event listeners
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchByType();
    }
});

// Filtros em tempo real
searchFilmes.addEventListener('input', applyFilters);
filterTipo.addEventListener('change', applyFilters);
filterGenero.addEventListener('change', applyFilters);

// Verificar permissões
async function checkUserPermissions() {
    try {
        const userRes = await fetch("/api/user-info");
        const userData = await userRes.json();
        
        if (userData.tipoUtilizador && userData.tipoUtilizador !== 2) {
            const addBtn = document.querySelector('.fab-add');
            if (addBtn) addBtn.style.display = 'none';
        }
    } catch (err) {
        console.log('Erro ao verificar permissões');
    }
}

// Inicializar
loadGeneros();
loadMovies();
checkUserPermissions();