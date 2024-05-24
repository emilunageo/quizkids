const mysql = require('mysql');

// Conexión a MySQL
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: '8889',  // Puerto de MySQL en MAMP
  user: 'root',
  password: 'root',
  database: 'quizkids'
});

// Conectar a la base de datos
connection.connect(error => {
  if (error) throw error;
  console.log('Conectado exitosamente a la base de datos.');
});

// Rutas para registrar alumnos y profesores
app.post('/registrar/alumno', (req, res) => {
  const { nombre, apellido, correo, contraseña } = req.body;
  const query = `INSERT INTO Alumnos (Nombre, Apellido, Correo, Contraseña) VALUES (?, ?, ?, ?)`;

  connection.query(query, [nombre, apellido, correo, contraseña], (err, results) => {
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).send('Error al registrar el alumno: ' + err.message);  // Agrega err.message para más detalles
    }
    res.redirect('/log-reg');
  });
});

app.post('/registrar/profesor', (req, res) => {
  const { nombre, apellido, correo, contraseña } = req.body;
  const query = `INSERT INTO Profesores (Nombre, Apellido, Correo, Contraseña) VALUES (?, ?, ?, ?)`;

  connection.query(query, [nombre, apellido, correo, contraseña], (err, results) => {
    if (err) {
      return res.status(500).send('Error al registrar el profesor');
    }
    res.send('Profesor registrado con éxito');
  });
});