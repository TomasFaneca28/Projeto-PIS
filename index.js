require('dotenv').config();
const express = require('express');
const path = require('path');
const securePassword = require("./src/services/securePassword");
const personsRoot = require('./src/routes/pessoas');
const professionsRoot = require('./src/routes/profissoes');
const generosRoot = require('./src/routes/generos');
const tmdbRoutes = require('./src/routes/tmdb');
const moviesRoutes = require('./src/routes/movies');
const pessoasFilmeRoutes = require('./src/routes/filmePessoa');

const db = require('./src/db/db'); 
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/tmdb', tmdbRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/genero', generosRoot);
app.use('/api/pessoas', personsRoot);
app.use('/api/professions', professionsRoot);
app.use('/api/pessoasFilme', pessoasFilmeRoutes);

app.post('/api/registo', async (req, res) => {
  const { nome, email, password, confirmPassword } = req.body;

  if (!nome || !email || !password || !confirmPassword) {
    return res.status(400).json({error: 'Todos os campos sao obrigatorios' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({error: 'As palavras-passe nao coincidem' });
  }

  const getTipoIdQuery = 'SELECT id FROM tipoutilizador WHERE tipo = "normalUser"';
  
  db.query(getTipoIdQuery, (err, results) => {
    if (err) {
      return res.status(500).json({error: 'Erro ao obter o tipo de utilizador' });
    }
    
    if (results.length === 0) {
      return res.status(500).json({error: 'Tipo de utilizador não encontrado' });
    }

    const tipoId = results[0].id;

    const verificaEmailQuery = 'SELECT * FROM utilizador WHERE email = ?';
    db.query(verificaEmailQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({error: 'Erro ao verificar o email' });
      }

      if (results.length > 0) {
        return res.status(400).json({error: 'Email ' + email + ' ja esta registado' });
      }

      const hashPassword = await securePassword.hash(password);

      const insertQuery = 'INSERT INTO utilizador (username, password, email, tipo) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [nome, hashPassword, email, tipoId], (err, results) => {
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

  const query = 'SELECT * FROM utilizador WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({error: 'Erro no servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({error: 'Email '+ email + ' nao se encontra registado' });
    }

    const user = results[0];
    const match = await securePassword.verify(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Email ou palavra-passe incorretos' });
    }

    res.status(200).json({ message: 'Login efetuado com sucesso', userId: user.id });
  });
});

// ========== ROTAS HTML (DEVEM VIR DEPOIS DAS ROTAS DA API) ==========
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

app.get('/filmeDetails', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/filmeDetails.html'));
});

app.get('/pessoaDetails', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html/pessoaDetails.html'));
});

app.get('/pessoas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/pessoas.html'));
});

app.get('/professions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/professions.html'));
});

app.get('/generos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/generos.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});