const apiProf = '/api/professions';
const apiPeople = '/api/pessoas';

const professionSelect = document.getElementById('professionSelect');
const filterProfession = document.getElementById('filterProfession');
const peopleList = document.getElementById('peopleList');
const personNameInput =document.getElementById('personName');
const photopathInput =document.getElementById('photopath');
const dataNascInput =document.getElementById('dataNasc');
const nacionalidadeinput =document.getElementById('nacionalidade');

const addPersonBtn = document.getElementById('addPersonBtn');
const personForm = document.getElementById('personForm');
const savePersonBtn = document.getElementById('savePersonBtn');
const cancelPersonBtn = document.getElementById('cancelPersonBtn');

let professions = [];
let editingPersonId = null; 

//serve para fazer um request para selecionar todas as profissões e também para preencher os select's pretendidos

function fetchProfessions(selectElement, keepFirstOption=false) {

  fetch(apiProf)
    .then(res => res.json())
    .then(data => {
      if (!keepFirstOption) {
        selectElement.innerHTML = ''; 
      } else {
     
        const firstOption = selectElement.querySelector('option');
        selectElement.innerHTML = '';
        if (firstOption) {
          const clone = firstOption.cloneNode(true); 
          selectElement.appendChild(clone);
        }
      }

      data.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.tipo;
        selectElement.appendChild(option);
      });
    });
}

// Buscar pessoas
function fetchPeople() {
  fetch(apiPeople)
    .then(res => res.json())
    .then(data => {
      peopleList.innerHTML = '';
      const selected = filterProfession.value;

      // Filtrar pessoas
      const filtered = selected === 'all'
        ? data
        : data.filter(p => p.professionId == selected);

      if(!filtered || data.length === 0){
        const header=document.getElementById('listaHeader');
        header.innerHTML="Não existem pessoas para listar";
      
      }else{
        filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <img src=${p.photopath} />
          <h3>${p.nome}</h3>
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
      
  const nome = personNameInput.value;
  const professionId = professionSelect.value;
  const photopath = photopathInput.value;
  const dataNasc = dataNascInput.value;
  const nacionalidade = nacionalidadeinput.value;

  if (editingPersonId) {
    // Editar pessoa
    fetch(`${apiPeople}/${editingPersonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, professionId, photopath, dataNasc, nacionalidade})
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
      body: JSON.stringify({ nome, professionId, photopath, dataNasc, nacionalidade })
    }).then(() => {
      personForm.classList.add('hidden');
      fetchPeople();
    });
  }
  personNameInput.value='';
  photopathInput.src ='';
  
  dataNascInput.value ='';
  nacionalidadeinput.value ='';

  professionSelect.value='';
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
      personNameInput.value =p.nome;
      photopathInput.src =p.photopath;
      const date = new Date(p.dataNascimento);
      dataNascInput.value = date.getDate().toString();
      nacionalidadeinput.value =p.nacionalidade;
      professionSelect.value = p.professionId;

      personForm.classList.remove('hidden');
    });
}

filterProfession.addEventListener('change', fetchPeople);
// Inicialização
fetchProfessions(filterProfession, true);
fetchProfessions(professionSelect);
fetchPeople();

