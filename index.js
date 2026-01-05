const express = require('express');
var mysql = require('mysql2');
const path = require('path');
const securePassword = require("./src/services/securePassword");
//const routes = require('./src/routes');

var connectionOptions = {
 host: "localhost",
 user: "root",
 password: "",
 database: "projetopis"
};

var connection = mysql.createConnection(connectionOptions);


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

connection.connect();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/login.html'));
});

app.get('/registo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/registo.html'));
});

app.get('/reviews', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/reviews.html'));
});

app.get('/movies', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/movies.html'));
});


//API

// POST /api/registo
app.post('/api/registo', async (req, res) => {
  const { nome, email, password, confirmPassword } = req.body;

  // Validar campos obrigatorios
  if (!nome || !email || !password || !confirmPassword) {
    return res.status(400).json({error: 'Todos os campos sao obrigatorios' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({error: 'As palavras-passe nao coincidem' });
  }

  const getTipoIdQuery = 'SELECT id FROM tipoutilizador WHERE tipo = "normalUser"';
  
  // Obter o ID do tipo de utilizador "normalUser"
  connection.query(getTipoIdQuery, (err, results) => {
    if (err) {
      return res.status(500).json({error: 'Erro ao obter o tipo de utilizador' });
    }
    
    if (results.length === 0) {
      return res.status(500).json({error: 'Tipo de utilizador não encontrado' });
    }

    const tipoId = results[0].id;

    // Verificar se o email ja esta registado
    const verificaEmailQuery = 'SELECT * FROM utilizador WHERE email = ?';
    connection.query(verificaEmailQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({error: 'Erro ao verificar o email' });
      }

      if (results.length > 0) {
        return res.status(400).json({error: 'Email ' + email + ' ja esta registado' });
      }

      // Inserir o novo utilizador na base de dados
      const hashPassword = await securePassword.hash(password);

      const insertQuery = 'INSERT INTO utilizador (username, password, email, tipo) VALUES (?, ?, ?, ?)';
      connection.query(insertQuery, [nome, hashPassword, email, tipoId], (err, results) => {
        if (err) {
          return res.status(500).json({error: 'Erro ao criar utilizador' });
        }
        res.status(201).json({ message: 'Utilizador registado com sucesso', userId: results.insertId });
      });
    });
  });
});

// POST /api/login 
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({error: 'Email e palavra-passe sao obrigatorios' });
  }

  // Procura apenas o utilizador com o email fornecido
  const query = 'SELECT * FROM utilizador WHERE email = ?';
  connection.query(query, [email], async (err, results) => {

    if (err) {
      return res.status(500).json({error: 'Erro no servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({error: 'Email '+ email + ' nao se encontra registado' });
    }

    const user = results[0];

    // Compara a password com hash com a password na base de dados
    const match = await securePassword.verify(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Email ou palavra-passe incorretos' });
    }

    res.status(200).json({ message: 'Login efetuado com sucesso', userId: user.id });
  });
});





app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
