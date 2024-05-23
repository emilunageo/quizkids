const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Middleware para parsear el cuerpo de las peticiones HTTP
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos
app.use(express.static('public'));

// Motor de plantillas para las vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // Asumiendo que estás usando EJS

// Ruta inicial que sirve el index.html
app.get('/', (req, res) => {
  res.render(path.join(__dirname, 'views', 'index.ejs'));
});

app.get('/signup', (req, res) => {
  res.render(path.join(__dirname, 'views', 'signup.ejs'));
});

app.get('/login', (req, res) => {
  res.render(path.join(__dirname, 'views', 'login.ejs'));
});

app.get('/student', (req, res) => {
  res.render(path.join(__dirname, 'views', 'student.ejs'));
});

app.get('/profile', (req, res) => {
  res.render(path.join(__dirname, 'views', 'profile.ejs'));
});

app.get('/settings', (req, res) => {
  res.render(path.join(__dirname, 'views', 'settings-alumno.ejs'));
});

/* app.get('/log-reg', (req, res) => {
  res.render(path.join(__dirname, 'views', 'log-reg.ejs'));
}); */

app.get('/ranking', (req, res) => {
  res.render(path.join(__dirname, 'views', 'ranking.ejs'));
});

/* app.get('/h', (req, res) => {
  res.render(path.join(__dirname, 'views', 'learnIt.ejs'));
}); */

app.get('/testit', (req, res) => {
  res.render(path.join(__dirname, 'views', 'test-it.ejs'));
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});