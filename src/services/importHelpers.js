const db = require('../db/db'); 
const { promisify } = require('util');

const query = promisify(db.query).bind(db);

// =====================
// PEGI
// =====================
async function getOrCreatePegi(valor) {
    const rows = await query(
        'SELECT id FROM Pegi WHERE tipo = ?',
        [valor]
    );

    if (rows.length > 0) return rows[0].id;

    const result = await query(
        'INSERT INTO Pegi (tipo) VALUES (?)',
        [valor]
    );

    return result.insertId;
}

// =====================
// TIPO PROFISSÃO
// =====================
async function getOrCreateTipoProfissao(nome) {
    const rows = await query(
        'SELECT id FROM TipoProfissao WHERE tipo = ?',
        [nome]
    );

    if (rows.length > 0) return rows[0].id;

    const result = await query(
        'INSERT INTO TipoProfissao (tipo) VALUES (?)',
        [nome]
    );

    return result.insertId;
}

async function getPersonDetailsFromTMDb(personId, apiKey) {
  const res = await fetch(`https://api.themoviedb.org/3/person/${personId}?api_key=${apiKey}&language=pt-PT`);
  if (!res.ok) throw new Error('Erro ao obter pessoa no TMDb');
  const data = await res.json();
  return {
    nome: data.name,
    photopath: data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : null,
    dataNascimento: data.birthday || null,
    nacionalidade: data.place_of_birth || null
  };
}

async function getOrCreatePessoa(personId, profissao, apiKey) {
  const tipo = await getOrCreateTipoProfissao(profissao);

  // Buscar detalhes do TMDb
  const details = await getPersonDetailsFromTMDb(personId, apiKey);

  return new Promise((resolve, reject) => {
    // Verifica se já existe pelo nome e data de nascimento
    query(
      'SELECT id FROM Pessoa WHERE nome=? AND dataNascimento=?',
      [details.nome, details.dataNascimento],
      (err, results) => {
        if (err) return reject(err);

        if (results.length) {
          // Pessoa já existe
          resolve(results[0].id);
        } else {
          // Inserir nova pessoa
          query(
            'INSERT INTO Pessoa(nome, tipo, photopath, dataNascimento, nacionalidade) VALUES(?,?,?,?,?)',
            [details.nome, tipo, details.photopath, details.dataNascimento, details.nacionalidade],
            (err, r) => {
              if (err) return reject(err);
              resolve(r.insertId);
            }
          );
        }
      }
    );
  });
}

// =====================
// GÉNERO
// =====================
async function getOrCreateGenero(nome) {
    const rows = await query(
        'SELECT id FROM Genero WHERE nome = ?',
        [nome]
    );

    if (rows.length > 0) return rows[0].id;

    const result = await query(
        'INSERT INTO Genero (nome) VALUES (?)',
        [nome]
    );

    return result.insertId;
}

// =====================
// FILME / SÉRIE
// =====================
async function insertFilme(data) {
    // Verificar se o filme já existe pelo nome e data de lançamento
    const existingFilme = await query(
        `SELECT id FROM Filme 
         WHERE nome = ? AND DataLancamento = ? AND tipo = ?`,
        [data.nome, data.dataLancamento, data.tipo]
    );

    if (existingFilme.length > 0) {
        console.log('⚠️ Filme já existe na BD:', data.nome);
        return existingFilme[0].id;
    }

    // Inserir novo filme
    const result = await query(
        `INSERT INTO Filme
        (nome, idPegi, idDiretorPessoa, DataLancamento, tipo, posterPath, sinopese, duracao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.nome,
            data.pegi,
            data.diretor,
            data.dataLancamento,
            data.tipo,
            data.poster,
            data.sinopse,
            data.duracao
        ]
    );

    console.log('✅ Novo filme inserido:', data.nome);
    return result.insertId;
}

// =====================
// RELAÇÕES
// =====================
async function linkFilmeGenero(idFilme, idGenero) {
    await query(
        'INSERT IGNORE INTO FilmeGenero (idFilme, idGenero) VALUES (?, ?)',
        [idFilme, idGenero]
    );
}

async function linkFilmePessoa(idFilme, idPessoa, papel, principal) {
    await query(
        `INSERT IGNORE INTO FilmePessoa
        (idFilme, idPessoa, papel, elencoPrincipal)
        VALUES (?, ?, ?, ?)`,
        [idFilme, idPessoa, papel, principal]
    );
}

module.exports = {
    getOrCreatePegi,
    getOrCreatePessoa,
    getOrCreateGenero,
    linkFilmeGenero,
    linkFilmePessoa,
    insertFilme
};
