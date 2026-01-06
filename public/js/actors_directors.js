const ACTORS_API = '/api/actors';
const DIRECTORS_API = '/api/directors';

function showTab(tab) {
  actorsTab.classList.toggle('hidden', tab !== 'actors');
  directorsTab.classList.toggle('hidden', tab !== 'directors');
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

/* LOAD */
async function loadActors() {
  const res = await fetch(ACTORS_API);
  const actors = await res.json();

  actorsGrid.innerHTML = actors.map(a => `
    <div class="card">
      <h3>${a.name}</h3>
      <p>${new Date(a.birthdate).toLocaleDateString('pt-PT')}</p>
      <p>${a.nationality}</p>
      <div class="actions">
        <button class="btn outline" onclick="editPerson('actor', ${a.id})">Editar</button>
        <button class="btn outline" onclick="deletePerson('actor', ${a.id})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

async function loadDirectors() {
  const res = await fetch(DIRECTORS_API);
  const directors = await res.json();

  directorsGrid.innerHTML = directors.map(d => `
    <div class="card">
      <h3>${d.name}</h3>
      <p>${new Date(d.birthdate).toLocaleDateString('pt-PT')}</p>
      <p>${d.nationality}</p>
      <div class="actions">
        <button class="btn outline" onclick="editPerson('director', ${d.id})">Editar</button>
        <button class="btn outline" onclick="deletePerson('director', ${d.id})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

/* MODAL */
function openActorModal() {
  openModal('actor');
}

function openDirectorModal() {
  openModal('director');
}

function openModal(type) {
  modal.style.display = 'flex';
  modalTitle.innerText = type === 'actor' ? 'Adicionar Ator' : 'Adicionar Diretor';
  personType.value = type;
  personId.value = '';
  document.querySelector('form').reset();
}

function closeModal() {
  modal.style.display = 'none';
}

async function editPerson(type, id) {
  const api = type === 'actor' ? ACTORS_API : DIRECTORS_API;
  const res = await fetch(`${api}/${id}`);
  const p = await res.json();

  modal.style.display = 'flex';
  modalTitle.innerText = 'Editar';
  personType.value = type;
  personId.value = p.id;
  name.value = p.name;
  birthdate.value = p.birthdate;
  nationality.value = p.nationality;
}

/* SAVE */
async function savePerson(e) {
  e.preventDefault();

  const api = personType.value === 'actor' ? ACTORS_API : DIRECTORS_API;
  const method = personId.value ? 'PUT' : 'POST';
  const url = personId.value ? `${api}/${personId.value}` : api;

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name.value,
      birthdate: birthdate.value,
      nationality: nationality.value
    })
  });

  closeModal();
  loadActors();
  loadDirectors();
}

/* DELETE */
async function deletePerson(type, id) {
  const api = type === 'actor' ? ACTORS_API : DIRECTORS_API;
  if (confirm('Eliminar?')) {
    await fetch(`${api}/${id}`, { method: 'DELETE' });
    loadActors();
    loadDirectors();
  }
}