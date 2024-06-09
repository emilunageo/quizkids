const User = require("../models/user"); // Importar el modelo User se usa para interactuar con la base de datos.
const Student = require("../models/student"); // Importar el modelo Student se usa para interactuar con la base de datos.
const Professor = require("../models/professor"); // Importar el modelo Professor se usa para interactuar con la base de datos.

const userController = {};

userController.register = async (req, res) => {
  try {
    const userData = {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      fecha_de_nacimiento: req.body.fNacimiento,
      sexo: req.body.sexo,
      pais: req.body.pais,
      ciudad: req.body.ciudad,
      correo: req.body.correo,
      contrasena: req.body.contraseña,
      tipo_de_usuario: req.body.tipoUsuario,
    };
    
    User.add(userData, (result) => {
      const userId = result.insertId;

      if (req.body.tipoUsuario === "alumno") {
        const alumnoData = { id_usuario: userId, nombre: req.body.nombre };
        Student.add(alumnoData, () => {
          res.redirect("/");
        });
      } else if (req.body.tipoUsuario === "profesor") {
        const profesorData = { id_usuario: userId, nombre: req.body.nombre };
        Professor.add(profesorData, () => {
          res.redirect("/");
        });
      } else {
        res.redirect("/");
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = userController;
