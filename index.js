const express = require('express');
const path = require('path');
//const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

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

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});

module.exports = app;
