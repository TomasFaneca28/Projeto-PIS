const apiProf = '/api/professions';
const apiPeople = '/api/pessoas';

const professionSelect = document.getElementById('professionSelect');
const peopleList = document.getElementById('peopleList');

const addPersonBtn = document.getElementById('addPersonBtn');
const personForm = document.getElementById('personForm');
const savePersonBtn = document.getElementById('savePersonBtn');
const cancelPersonBtn = document.getElementById('cancelPersonBtn');

let professions = [];
let editingPersonId = null; 

// Buscar profissões
function fetchProfessions() {
  fetch(apiProf)
    .then(res => res.json())
    .then(data => {
      professions = data;
      professionSelect.innerHTML = '';
      data.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.tipo;
        professionSelect.appendChild(option);
      });
    });
}

// Buscar pessoas
function fetchPeople() {
  fetch(apiPeople)
    .then(res => res.json())
    .then(data => {
      peopleList.innerHTML = '';
      if(!data || data.length === 0){
        const header=document.getElementById('listaHeader');
        header.innerHTML="Não existem pessoas para listar";
      
      }else{
        data.forEach(p => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <h3>${p.name}</h3>
          <div>Profissão: ${p.professionName || 'Desconhecida'}</div>
          <div class="actions">
            <button class="btn outline" onclick="editPerson(${p.id})">Editar</button>
            <button class="btn outline" onclick="deletePerson(${p.id})">Eliminar</button>
          </div>
        `;
        peopleList.appendChild(div);
      });
        
      }
     
    });
   
}

// Adicionar pessoa
addPersonBtn.onclick = () => personForm.classList.remove('hidden');
cancelPersonBtn.onclick = () => personForm.classList.add('hidden');

savePersonBtn.onclick = () => {
  const name = document.getElementById('personName').value;
  const professionId = professionSelect.value;

  if (editingPersonId) {
    // Editar pessoa
    fetch(`${apiPeople}/${editingPersonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, professionId })
    }).then(() => {
      editingPersonId = null;
      personForm.classList.add('hidden');
      fetchPeople();
    });
  } else {
    // Adicionar nova pessoa
    fetch(apiPeople, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, professionId })
    }).then(() => {
      personForm.classList.add('hidden');
      fetchPeople();
    });
  }
};

// Eliminar pessoa
function deletePerson(id) {
  if (confirm('Tem certeza que deseja eliminar esta pessoa?')) {
    fetch(`${apiPeople}/${id}`, { method: 'DELETE' })
      .then(fetchPeople);
  }
}

// Abrir formulário para editar
function editPerson(id) {
  fetch(`${apiPeople}/${id}`)
    .then(res => res.json())
    .then(p => {
      editingPersonId = p.id;
      document.getElementById('personName').value = p.name;
      professionSelect.value = p.professionId;
      personForm.classList.remove('hidden');
    });
}

// Inicialização
fetchProfessions();
fetchPeople();