// Archivo principal de la aplicación.
// Configuración de rutas e inicio del servidor.
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require("mysql");
const { createPool } = require('mysql');
const session = require('express-session');

// Rutas de usuarios y autenticación
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// Rutas específicas de alumnos y profesores
const studentRoutes = require('./routes/studentRoutes');
const professorRoutes = require('./routes/professorRoutes');

// Crear la aplicación de Express
const app = express();
const port = 3000; // Puerto en el que correrá el servidor

// Configuración de middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(session({
  secret: 'tu_secreto',
  resave: false,
  saveUninitialized: true
}));

// Configuración de la base de datos
const pool = createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "quizkids",
  port: "8889",
});

// Función para verificar el tipo de usuario
function checkUserType(tipo) {
  return function (req, res, next) {
    if (req.session.tipoDeUsuario === tipo) {
      next();
    } else {
      res.status(403).send('Acceso denegado');
    }
  };
}

// Configuración del motor de plantillas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Cargar rutas
app.use('/', userRoutes);
app.use('/', authRoutes);
app.use('/student', studentRoutes);
app.use('/professor', professorRoutes);

// Rutas estáticas
app.use(express.static('public'));

// Ruta de inicio
app.get('/', (req, res) => {
  res.render('index');
});

// Rutas para la autenticación
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/login', (req, res) => {
  res.render('login');
});

// Middleware para añadir userId a res.locals
app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  next();
});

// Rutas específicas para alumnos
app.get('/student', checkUserType('alumno'), (req, res) => {
  res.render('student/index');
});

// Rutas para obtener datos de los quizzes
let Quizes = [];

pool.query(`SELECT * FROM Quizes;`, (err, result) => {
  if (err) {
    console.log(err);
  } else {
    result.forEach(row => {
      Quizes.push({
        nombre: row.nombre,
        id: row.id_quiz
      });
    });
  }
});

app.get('/testit', checkUserType('alumno'), (req, res) => {
  res.render('student/testit', { Quizes: Quizes });
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

// Rutas específicas para profesores
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

// Ruta para tomar un quiz
let questions = [];
let respuestas = [];
let resumen = [];

app.get('/take-quiz', checkUserType('alumno'), (req, res) => {
  const quizId = req.query.quizId;
  req.session.quizId = quizId;
  
// changes
getid_alumno(res.locals.userId).then(id_alumno => {

  pool.query(`SELECT * FROM QuizesContestados WHERE id_quiz = ? AND id_alumno = ?`, [quizId, id_alumno], (err, result) => {
  if (err) {
    console.log(err);
    res.status(500).send("Error en la base de datos");
  } 
  
  if (result.length > 0) {

    res.render('student');
    console.log(result);

  } else {

  pool.query(`SELECT * FROM Preguntas WHERE id_quiz = ?`, [quizId], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      result.forEach(row => {
        questions.push([row.contenido, row.id_pregunta]);
      });
    }
  });

  pool.query(`SELECT * FROM Respuestas WHERE id_quiz = ?`, [quizId], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      result.forEach(row => {
        respuestas.push([row.id_pregunta, row.contenido, row.valor]);
      });
      console.log(questions, respuestas );
      res.render('student/quiz', { questions, respuestas });
    }
  });
}
    });
  }); 

});

const getid_alumno = (id_usuario) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id_alumno FROM Alumnos WHERE id_usuario = ?`;
    pool.query(query, [id_usuario], (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length > 0) {
        resolve(results[0].id_alumno);
      } else {
        reject(new Error('No se encontró ningún alumno con el ID de usuario proporcionado.'));
      }
    });
  });
};


// Ruta para enviar el quiz
app.post('/submit-quiz', (req, res) => {
  let promedio = 0;

  questions.forEach((question, i) => {
    resumen.push([question, req.body[i]]);
    const confidenceLevel = req.body.confidence_level[i];
    if (confidenceLevel === "High") {
      promedio += 3;
    } else if (confidenceLevel === "Medium") {
      promedio += 2;
    } else if (confidenceLevel === "Low") {
      promedio += 1;
    }
  });

  promedio /= questions.length;
  const score = calculateScore(req.body);
  res.render('student/result', { score });

  questions = [];
  respuestas = [];

  const insertResult = (id_alumno, id_quiz, puntaje, nivel_confianza, resultados) => {
    const query = `
      INSERT INTO Resultados (id_alumno, id_quiz, puntaje, nivel_confianza, resultados)
      VALUES (?, ?, ?, ?, ?);
    `;

    const values = [id_alumno, id_quiz, puntaje, nivel_confianza, resultados];

    pool.query(query, values, (error, results) => {
      if (error) {
        console.error('Error ejecutando la consulta', error);
      } else {
        console.log('Resultado insertado:', results.insertId);
      }
    });
  };

  const quizIdd = req.session.quizId;

  getid_alumno(res.locals.userId)
    .then(id_alumno => {
      insertResult(id_alumno, quizIdd, score, promedio, `${resumen}`);



// changes

/*pool.query(`SELECT * FROM Resultados WHERE id_quiz = ? AND id_alumno = ?`, [quizIdd, id_alumno], (err, result) => {
  if (err) {
    console.log(err);
    res.status(500).send("Error en la base de datos");
  } else if (result.length > 0) {*/

    const insertarEnQuizesContestados = (id_alumno, id_quiz) => {
      const insertQuery = `
        INSERT INTO QuizesContestados (id_alumno, id_quiz)
        VALUES (?, ?)
      `;
    
      const values = [id_alumno, id_quiz];
    
      pool.query(insertQuery, values, (error, results, fields) => {
        if (error) {
          console.error('Error insertando en quizes_contestados', error);
          return;
        }
        console.log('Inserción exitosa en quizes_contestados:', results);
      
      });
    };

    insertarEnQuizesContestados(id_alumno, quizIdd);
  });
});
   

//

  



// Función para calcular la puntuación
function calculateScore(userAnswers) {
  let score = 0;
  for (const answer in userAnswers) {
    if (userAnswers[answer] === '1') {
      score++;
    }
  }
  return score;
}

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}); 
