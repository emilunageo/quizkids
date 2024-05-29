const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: '8889',  // Puerto de MySQL en MAMP
  user: 'root',
  password: 'root',
  database: 'pruebas'
});

connection.connect(error => {
  if (error) throw error;
  console.log('Conectado exitosamente a la base de datos.');
});

module.exports = connection;