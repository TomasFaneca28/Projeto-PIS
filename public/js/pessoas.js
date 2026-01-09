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
let isAdmin = false;

// Inicializar permissões do utilizador
async function initPermissions() {
  try {
    const res = await fetch('/api/user-info');
    const data = await res.json();
    isAdmin = !!data && data.tipoUtilizador === 2;
  } catch (err) {
    isAdmin = false;
  }
}

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
        header.innerHTML="Não existem pessoas a listar";
      
      }else{
        filtered.forEach(p => {
          console.log(p.photopath);
        const poster = p.photoPath
                ? `https://image.tmdb.org/t/p/w500${p.photoPath}`
                : '/images/logo.svg';
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
        <a href="/pessoaDetails?id=${p.id}" style="text-decoration: none; color: inherit;">
          <img src="${poster}" width='30%' />
          <h3>${p.nome}</h3>
          <div>Profissão: ${p.professionName || 'Desconhecida'}</div></a>
          ${isAdmin ? `<div class="actions">
            <button class="btn outline" onclick="deletePerson(${p.id})">Eliminar</button>
          </div>` : ''}
        `;
        peopleList.appendChild(div);
      });
        
      }
     
    });
   
}

// Adicionar pessoa
//addPersonBtn.onclick = () => personForm.classList.remove('hidden');
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
    }).then(res => {
      if (res.status === 403) {
        alert('Apenas administradores podem editar pessoas');
      } else {
        editingPersonId = null;
        personForm.classList.add('hidden');
        fetchPeople();
      }
    });
  } else {
    // Adicionar nova pessoa
    fetch(apiPeople, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, professionId, photopath, dataNasc, nacionalidade })
    }).then(res => {
      if (res.status === 403) {
        alert('Apenas administradores podem adicionar pessoas');
      } else {
        personForm.classList.add('hidden');
        fetchPeople();
      }
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
      .then(res => {
        if (res.status === 403) {
          alert('Apenas administradores podem eliminar pessoas');
        } else {
          return res.json().then(() => fetchPeople());
        }
      })
      .catch(err => console.error(err));
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
initPermissions().then(fetchPeople).catch(fetchPeople);

