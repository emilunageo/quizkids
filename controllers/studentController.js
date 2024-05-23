const connection = require('../databases/connection'); // Asumiendo que tienes un archivo connection.js

exports.registrarAlumno = (req, res) => {
  const { nombre, apellido, correo, contraseña } = req.body;
  const query = `INSERT INTO Alumnos (Nombre, Apellido, Correo, Contraseña) VALUES (?, ?, ?, ?)`;

  connection.query(query, [nombre, apellido, correo, contraseña], (err, results) => {
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).send('Error al registrar el alumno: ' + err.message);
    }
    res.redirect('/log-reg');
  });
};
