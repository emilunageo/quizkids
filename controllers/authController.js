const User = require("../models/user");
const Alumno = require("../models/student");
const Profesor = require("../models/professor");
const authController = {};
let userId = null;

authController.register = async (req, res) => {
  try {
    const userData = {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      fecha_de_nacimiento: req.body.fecha_de_nacimiento,
      estado: req.body.estado,
      correo: req.body.correo,
      contrasena: req.body.contrasena,
      tipo_de_usuario: req.body.tipo_de_usuario,
    };

    User.add(userData, (result) => {
      const userId = result.insertId;
      if (req.body.tipo_de_usuario === "alumno") {
        const alumnoData = { id_usuario: userId, nombre: req.body.nombre };
        Alumno.add(alumnoData, () => {
          res.redirect("/login");
        });
      } else if (req.body.tipo_de_usuario === "profesor") {
        const profesorData = { id_usuario: userId, nombre: req.body.nombre };
        Profesor.add(profesorData, () => {
          res.redirect("/login");
        });
      } else {
        res.redirect("/");
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

authController.login = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { correo, contrasena } = req.body;
    console.log("Correo:", correo);
    console.log("Contraseña:", contrasena);


    User.findByEmail(correo, async (user) => {
      console.log("Usuario encontrado:", user);
      res.locals.userId = user.id_usuario;
      //exports.userId = id_usuario;
      console.log(
        "Contraseña del usuario en la base de datos:",
        user.contrasena,
      );

      if (contrasena) {
        const isMatch = contrasena === user.contrasena;
        console.log("Contraseña coincide:", isMatch);

        if (isMatch) {
          req.session.userId = user.id_usuario;
          req.session.tipoDeUsuario = user.tipo_de_usuario;

          if (user.tipo_de_usuario === "alumno") {
            res.redirect("/student");
          } else if (user.tipo_de_usuario === "profesor") {
            res.redirect("/professor");
          } else {
            res.redirect("/");
          }
        } else {
          res.status(401).send("Correo o contraseña incorrectos");
        }
      } else {
        res.status(400).send("Contraseña no proporcionada");
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = authController;