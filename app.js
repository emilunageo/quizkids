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
app.set('view engine', 'ejs');

// Rutas
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/student', (req, res) => {
  res.render('student');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.get('/settings', (req, res) => {
  res.render('settings-alumno');
});

app.get('/ranking', (req, res) => {
  res.render('ranking');
});

app.get('/testit', (req, res) => {
  res.render('test-it');
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
