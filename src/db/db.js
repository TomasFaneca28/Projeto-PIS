var mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  database: 'projetopis',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Erro ao ligar à base de dados:', err.message);
  } else {
    console.log('Ligação à base de dados estabelecida');
    connection.release();
  }
});

module.exports = db;