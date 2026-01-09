const apiUrl = '/api/genero';

const addBtn = document.getElementById('addBtn');
const formContainer = document.getElementById('formContainer');
const nomeInput = document.getElementById('nome');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const generosList = document.getElementById('generosList');

let editingId = null;

function fetchGeneros() {
    fetch(apiUrl)
        .then(res => res.json())
        .then(renderGeneros);
}

function renderGeneros(generos) {
    generosList.innerHTML = '';
    generos.forEach(p => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <h3>${p.nome}<h3>
            <div class="actions">
                <button class="btn outline" onclick="editGenero(${p.id}, '${p.nome}')">Editar</button>
                <button class="btn outline" onclick="deleteGenero(${p.id})">Eliminar</button>
            </div>
        `;
        generosList.appendChild(div);
    });
}

function editGenero(id, nome) {
    editingId = id;
    nomeInput.value = nome;
    formContainer.classList.remove('hidden');
}

function deleteGenero(id) {
    if (confirm('Tem certeza que deseja eliminar este género?')) {
        fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.status === 403) {
                    alert('Apenas administradores podem eliminar géneros');
                } else {
                    return res.json().then(() => fetchGeneros());
                }
            })
            .catch(err => console.error(err));
    }
}

addBtn.onclick = () => {
    editingId = null;
    nomeInput.value = '';
    formContainer.classList.remove('hidden');
};

cancelBtn.onclick = () => formContainer.classList.add('hidden');

saveBtn.onclick = () => {
    const data = {
        nome: nome.value,
    };

    if (editingId) {
        fetch(`${apiUrl}/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (res.status === 403) {
                alert('Apenas administradores podem editar géneros');
            } else {
                formContainer.classList.add('hidden');
                fetchGeneros();
            }
        });
    } else {
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (res.status === 403) {
                alert('Apenas administradores podem adicionar géneros');
            } else {
                formContainer.classList.add('hidden');
                fetchGeneros();
            }
        });
    }
    nomeInput.value = '';
};

fetchGeneros();