const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10, // Número máximo de conexiones en el pool
  host: "82.180.160.179",
  port: "3306", // 3306
  user: "root",
  password: 'root',
  database: "quizkids",
});

module.exports = pool;
