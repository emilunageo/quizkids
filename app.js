// Descripción: Archivo principal de la aplicación.
// En este archivo se configuran las rutas y se inicia el servidor.
const express = require('express');
const path = require('path');

// Rutas de usuarios y autenticación
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// Rutas específicas de alumnos y profesores
const studentRoutes = require('./routes/studentRoutes');
const professorRoutes = require('./routes/professorRoutes');
//const classRoutes = require('./routes/classRoutes');

// Crear la aplicación de Express
const app = express();
const port = 3000; // Puerto en el que correrá el servidor

// Middleware para parsear el cuerpo de las peticiones HTTP (req.body) en JSON y texto plano (req.text).
// Está línea es necesaria para poder recibir datos de formularios HTML.
app.use(express.urlencoded({ extended: true }));
// Middleware para parsear el cuerpo de las peticiones HTTP (req.body) en JSON.
app.use(express.json());

// Configuración de la sesión
app.use(session({
  secret: 'tu_secreto',
  resave: false,
  saveUninitialized: true
}));

function checkUserType(tipo) {
  return function (req, res, next) {
    if (req.session.tipoDeUsuario === tipo) {
      next();
    } else {
      res.status(403).send('Acceso denegado');
    }
  };
}

// Servir archivos estáticos
// Los archivos estáticos son archivos que no cambian, como imágenes, hojas de estilo y scripts.
app.use(express.static('public'));

// Motor de plantillas para las vistas
// Las vistas son archivos HTML que se renderizan en el servidor.
app.set('views', path.join(__dirname, 'views'));
// El motor de plantillas es EJS (Embedded JavaScript), que permite incrustar código JavaScript en HTML.
app.set('view engine', 'ejs');

// Usa las rutas de usuarios y autenticación
// Las rutas son archivos que contienen las rutas de la aplicación.
// Cada ruta se asocia con un controlador que maneja la lógica de la ruta.
// Las rutas se agrupan en archivos para mantener la aplicación organizada.
// Las rutas se definen en el archivo routes/userRoutes.js.
app.use('/', userRoutes);
app.use('/', authRoutes);

// Rutas específicas de alumnos y profesores
app.use('/student', studentRoutes);
app.use('/professor', professorRoutes);
//app.use('/class', classRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/login', (req, res) => {
  res.render('login');
});

// Rutas para alumno
app.get('/student', checkUserType('alumno'), (req, res) => {
  res.render('student/index');
});

app.get('/student-profile', checkUserType('alumno'), (req, res) => {
  res.render('student/profile');
});

app.get('/student-ranking', checkUserType('alumno'), (req, res) => {
  res.render('student/ranking');
});

app.get('/student-settings', checkUserType('alumno'), (req, res) => {
  res.render('student/settings');
});


// Rutas para profesor
app.get('/professor', checkUserType('profesor'), (req, res) => {
  res.render('professor/index');
});

app.get('/professor-profile', checkUserType('profesor'), (req, res) => {
  res.render('professor/profile');
});

app.get('/professor-dashboard', checkUserType('profesor'), (req, res) => {
  res.render('professor/dashboard');
});

app.get('/professor-create-quiz', checkUserType('profesor'), (req, res) => {
  res.render('professor/create-quiz');
});

app.get('/professor-settings', checkUserType('profesor'), (req, res) => {
  res.render('professor/settings');
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
