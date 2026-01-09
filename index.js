require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const securePassword = require("./src/services/securePassword");
const requireLogin = require('./src/middleware/requireLogin');
const personsRoot = require('./src/routes/pessoas');
const professionsRoot = require('./src/routes/profissoes');
const generosRoot = require('./src/routes/generos');
const tmdbRoutes = require('./src/routes/tmdb');
const moviesRoutes = require('./src/routes/movies');
const filmePessoaRoot = require('./src/routes/filmePessoa');
const authRoutes = require('./src/routes/auth');

const db = require('./src/db/db'); 
const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sessões
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 horas
}));

// Não servir automaticamente public/index.html para '/'
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
app.use('/api', authRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/movies', moviesRoutes);

app.get('/', requireLogin,(req, res) => {
  res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/login.html'));
});

app.get('/registo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/registo.html'));
});

app.get('/reviews', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/reviews.html'));
});

app.get('/movies', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/movies.html'));
});

app.get('/pessoas', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/pessoas.html'));
});

app.get('/professions', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/professions.html'));
});

app.get('/generos', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/generos.html'));
});

app.get('/perfil', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html/perfil.html'));
});

app.use('/api/genero',generosRoot);
app.use('/api/pessoas',personsRoot);
app.use('/api/pessoasFilme',filmePessoaRoot);
app.use('/api/professions',professionsRoot);

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
