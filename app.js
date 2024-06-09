const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const { setUserId } = require('./middlewares/authMiddleware');
const pool = require('./config/db');


const { exec } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Rutas de usuarios y autenticación
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// Rutas específicas de alumnos y profesores
const studentRoutes = require('./routes/studentRoutes');
const professorRoutes = require('./routes/professorRoutes');

// Rutas para las clases y quizzes
const classRoutes = require('./routes/classes'); // Importar la nueva ruta
const quizRoutes = require('./routes/quizzes'); // Importar la nueva ruta

// Crear la aplicación de Express
const app = express();
const port = 3001; // Puerto en el que correrá el servidor

// Configuración de middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());
app.use(session({
  secret: 'tu_secreto',
  resave: false,
  saveUninitialized: true
}));

// Usar middleware para configurar res.locals.userId
app.use(setUserId);

// Middleware para añadir userId a res.locals
app.use((req, res, next) => {
  console.log(`userId en res.locals: ${res.locals.userId}`);
  res.locals.userId = req.session.userId;
  next();
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
app.use('/classes', classRoutes); // Usar la nueva ruta
app.use('/quizzes', quizRoutes); // Usar la nueva ruta

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

// Rutas específicas para alumnos
app.get('/student', checkUserType('alumno'), (req, res) => {
  res.render('student/index');
});

// Rutas para obtener datos de los quizzes
let Quizes = [];

pool.query('SELECT * FROM Quizes;', (err, result) => {
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

app.get('/learnit', (req, res) => {
  const scriptPath = path.join('ia', 'app.py');
  const command = `streamlit run ${scriptPath}`;

  exec(command, (error, stdout, stderr) => {
      if (error) {
          console.error(`Error ejecutando el comando: ${error.message}`);
          res.status(500).send('Error ejecutando el comando');
          return;
      }

      if (stderr) {
          console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      res.send('Streamlit app is running');
  });
  setTimeout(() => {
  res.render('student/index') }, 2000); // Espera de 4 segundos;
});

// Nueva ruta para obtener quizzes por categoría
app.get('/testit', checkUserType('alumno'), (req, res) => {
  const userId = res.locals.userId;
  const categoriaSeleccionada = req.query.categoria || 'Todas';

  getid_alumno(userId).then(id_alumno => {
    pool.query('SELECT id_quiz FROM QuizesContestados WHERE id_alumno = ?', [id_alumno], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error en la base de datos');
      } else {
        const contestados = result.map(row => row.id_quiz);

        let query = 'SELECT Quizes.*, Categorias.nombre AS categoria FROM Quizes JOIN Categorias ON Quizes.id_categoria = Categorias.id_categoria';
        let queryParams = [];

        if (categoriaSeleccionada !== 'Todas') {
          query += ' WHERE Categorias.nombre = ?';
          queryParams.push(categoriaSeleccionada);
        }

        pool.query(query, queryParams, (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).send('Error en la base de datos');
          } else {
            let quizzes = result.map(row => ({
              nombre: row.nombre,
              id: row.id_quiz,
              categoria: row.categoria,
              contestado: contestados.includes(row.id_quiz)
            }));

            // Ordenar los quizzes para que los contestados estén al final
            quizzes.sort((a, b) => {
              if (a.contestado && !b.contestado) return 1;
              if (!a.contestado && b.contestado) return -1;
              return 0;
            });

            pool.query('SELECT nombre FROM Categorias', (err, categoriasResult) => {
              if (err) {
                console.log(err);
                res.status(500).send('Error en la base de datos');
              } else {
                const Categorias = categoriasResult.map(row => row.nombre);
                res.render('student/testit', { quizzes, Categorias, categoriaSeleccionada });
              }
            });
          }
        });
      }
    });
  }).catch(err => {
    console.log(err);
    res.status(500).send('Error en la base de datos');
  });
});

app.get('/student-profile', checkUserType('alumno'), (req, res) => {
  res.render('student/profile');
});

app.get('/student-ranking', (req, res) => {
  const query = `
    SELECT A.nombre, R.id_alumno, SUM(R.puntaje) AS total_puntaje
    FROM Resultados R
    JOIN Alumnos A ON R.id_alumno = A.id_alumno
    GROUP BY R.id_alumno, A.nombre
    ORDER BY total_puntaje DESC;
  `;
  
  pool.query(query, (error, results) => {
    if (error) throw error;
    res.render('student/ranking', { ranking: results });
  });
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
  questions = [];
  respuestas = [];

  getid_alumno(res.locals.userId).then(id_alumno => {
    pool.query('SELECT * FROM QuizesContestados WHERE id_quiz = ? AND id_alumno = ?', [quizId, id_alumno], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error en la base de datos');
      } else if (result.length > 0) {
        res.render('student');
        console.log(result);
      } else {
        pool.query('SELECT * FROM Preguntas WHERE id_quiz = ?', [quizId], (err, result) => {
          if (err) {
            console.log(err);
          } else {
            result.forEach(row => {
              questions.push([row.contenido, row.id_pregunta]);
            });
          }
        });

        pool.query('SELECT * FROM Respuestas WHERE id_quiz = ?', [quizId], (err, result) => {
          if (err) {
            console.log(err);
          } else {
            result.forEach(row => {
              respuestas.push([row.id_pregunta, row.contenido, row.valor]);
            });
            console.log(questions, respuestas);
            res.render('student/quiz', { questions, respuestas });
          }
        });
      }
    });
  });
});


const getid_alumno = id_usuario => {
  return new Promise((resolve, reject) => {
    console.log(`Buscando id_alumno para id_usuario: ${id_usuario}`);
    const query = 'SELECT id_alumno FROM Alumnos WHERE id_usuario = ?';
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
    if (confidenceLevel === 'High') {
      promedio += 3;
    } else if (confidenceLevel === 'Medium') {
      promedio += 2;
    } else if (confidenceLevel === 'Low') {
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

  getid_alumno(res.locals.userId).then(id_alumno => {
    insertResult(id_alumno, quizIdd, score, promedio, `${resumen}`);

    const insertarEnQuizesContestados = (id_alumno, id_quiz) => {
      const insertQuery = `
        INSERT INTO QuizesContestados (id_alumno, id_quiz)
        VALUES (?, ?);
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
