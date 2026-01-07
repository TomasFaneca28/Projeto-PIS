const apiUrl = '/api/professions';

const addBtn = document.getElementById('addBtn');
const formContainer = document.getElementById('formContainer');
const tipo = document.getElementById('tipo');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const professionsList = document.getElementById('professionsList');

let editingId = null;

function fetchProfessions() {
    fetch(apiUrl)
        .then(res => res.json())
        .then(renderProfessions);
}

function renderProfessions(professions) {
    professionsList.innerHTML = '';
    professions.forEach(p => {
        const div = document.createElement('div');
        div.className = 'profession';
        div.innerHTML = `
            <strong>${p.tipo}</strong>
            <button onclick="editProfession(${p.id}, '${p.tipo}')">Editar</button>
            <button onclick="deleteProfession(${p.id})">Eliminar</button>
        `;
        professionsList.appendChild(div);
    });
}

function editProfession(id, tipo) {
    editingId = id;
    tipo.value = tipo;
    formContainer.classList.remove('hidden');
}

function deleteProfession(id) {
    if (confirm('Tem certeza que deseja eliminar esta profissão?')) {
        fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
            .then(() => fetchProfessions());
    }
}

addBtn.onclick = () => {
    editingId = null;
    tipo.value = '';
    formContainer.classList.remove('hidden');
};

cancelBtn.onclick = () => formContainer.classList.add('hidden');

saveBtn.onclick = () => {
    const data = {
        tipo: tipo.value,
       
    };

    if (editingId) {
        fetch(`${apiUrl}/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(() => {
            formContainer.classList.add('hidden');
            fetchProfessions();
        });
    } else {
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(() => {
            formContainer.classList.add('hidden');
            fetchProfessions();
        });
    }
};

fetchProfessions();