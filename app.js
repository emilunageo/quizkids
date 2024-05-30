// Descripción: Archivo principal de la aplicación.
// En este archivo se configuran las rutas y se inicia el servidor.
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require("mysql");
const { createPool } = require('mysql');
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
app.use(express.static("public"));
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

const pool = createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "quizkids",
  port: "8889",

})

var Quizes = [] ;

pool.query(`select * from Quizes;`, function(err, result, fields) {

  if (err) {
      return console.log(err);
  }
  result.forEach((row) => {
      Quizes.push({
        nombre : row.nombre , 
        id : row.id_quiz
      });
  });
})


app.get('/testit', checkUserType('alumno'), (req, res) => {
  res.render('student/testit' , { Quizes : Quizes });
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

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


var questions = [];
var respuestas = [];
var resumen = [];

app.use(session({
  secret: '123', // replace with a strong secret key
  resave: false,
  saveUninitialized: true
}));

app.get('/take-quiz', checkUserType('alumno'), (req, res) => {

  quizId = req.query.quizId;
  req.session.quizId = quizId; // Store quizId in the session


  pool.query(`SELECT * FROM Preguntas WHERE id_quiz = '${quizId}';`, function(err, result, fields) {
    if (err) {
        return console.log(err);
    }
    result.forEach((row) => {
        questions.push(([row.contenido, row.id_pregunta]));
    });

  });
  
  pool.query(`SELECT * FROM Respuestas WHERE id_quiz = '${quizId}';`, function(err, result, fields) {
    if (err) {
        return console.log(err);
    }
    result.forEach((row) => {
        respuestas.push(([row.id_pregunta, row.contenido, row.valor]));
    });

  res.render('student/quiz' , { questions , respuestas });

});

});

app.use(function(req, res, next) {
  res.locals.userId = req.session.userId;

  next();
});

app.post('/submit-quiz', (req, res) => {
  const score = calculateScore(req.body);
  res.render('student/result', { score });
  var promedio = 0 ;

  for (var i = 0 ; i < questions.length ; i++ ){
      resumen.push([questions[i], req.body[i]]);
      if (req.body.confidence_level[i] === "High"){
        promedio += 3;
      } else if (req.body.confidence_level[i] === "Medium"){
        promedio += 2;
      } else if (req.body.confidence_level[i] === "Low"){
        promedio += 1;
      }
  }
  promedio /= questions.length;
 // resumen.push(`promedio : ${promedio}`);
 // resumen.push(`score : ${score}`);
  console.log(resumen);

  const insertResult = (id_alumno, id_quiz, puntaje, nivel_confianza, resultados) => {
    const query = `
      INSERT INTO Resultados (id_alumno, id_quiz, puntaje, nivel_confianza, resultados)
      VALUES (?, ?, ?, ?, ?);
    `;
  
    const values = [id_alumno, id_quiz, puntaje, nivel_confianza, resultados];
  
    pool.query(query, values, (error, results, fields) => {
      if (error) {
        console.error('Error ejecutando la consulta', error);
        return;
      }
      console.log('Resultado insertado:', results.insertId);
      // Cerrar la conexión del pool
      pool.end((err) => {
        if (err) {
          console.error('Error cerrando la conexión', err);
        }
      });
    });
  };

  const getid_alumno = (id_usuario) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT id_alumno 
                     FROM Alumnos 
                     WHERE id_usuario = ?`;
      const values = [id_usuario];
      
      pool.query(query, values, (error, results, fields) => {
        if (error) {
          console.error('Error ejecutando la consulta', error);
          reject(error);
          return;
        }
        if (results.length > 0) {
          // Accede al primer resultado (asumiendo que solo esperas uno)
          const id_alumno = results[0].id_alumno;
          resolve(id_alumno);
        } else {
          reject(new Error('No se encontró ningún alumno con el ID de usuario proporcionado.'));
        }
      });
    });
  };

   const quizIdd = req.session.quizId; // Retrieve quizId from the session

  id = res.locals.userId;
  getid_alumno(id)
  .then(id_alumno => {
    insertResult(id_alumno , quizIdd, score, promedio, `${resumen}`);
  })
  .catch(error => {
    console.error('Error:', error);
  });





  });


function calculateScore(userAnswers) {
  let score = 0; 
  for (const answer in userAnswers) {
      if (userAnswers[answer] === '1') {
          score++; 
      }
  }
  return score;
}


