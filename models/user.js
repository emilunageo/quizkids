const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: '8889',
  user: 'root',
  password: 'root',
  database: 'pruebas'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos.');
});

const User = {};

User.add = (userData, callback) => {
    const sql = 'INSERT INTO Usuarios SET ?';
    connection.query(sql, userData, (err, result) => {
        if (err) throw err;
        callback(result);
    });
};

User.findByEmail = (correo, callback) => {
    const sql = 'SELECT * FROM Usuarios WHERE correo = ?';
    connection.query(sql, [correo], (err, result) => {
        if (err) throw err;
        callback(result[0]);
    });
};

module.exports = User;
