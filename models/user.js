const pool = require('../config/db');

const User = {};

User.add = (userData, callback) => {
    const sql = 'INSERT INTO Usuarios SET ?';
    pool.query(sql, userData, (err, result) => {
        if (err) throw err;
        callback(result);
    });
};

User.findByEmail = (correo, callback) => {
    const sql = 'SELECT * FROM Usuarios WHERE correo = ?';
    pool.query(sql, [correo], (err, result) => {
        if (err) throw err;
        callback(result[0]);
    });
};

module.exports = User;
