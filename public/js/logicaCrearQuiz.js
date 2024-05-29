let preguntas = [];
const form = document.getElementById('quiz-form');
const addQuestionBtn = document.getElementById('add-question');
const createQuizBtn = document.getElementById('create-quiz');
const estados = document.getElementById('estados').children;
const modal = document.getElementById('modal');
const saveEditBtn = document.getElementById('save-edit');
let currentEditIndex = -1;

addQuestionBtn.addEventListener('click', function() {
    const pregunta = document.getElementById('pregunta').value;
    const respuesta1 = document.getElementById('respuesta1').value;
    const respuesta2 = document.getElementById('respuesta2').value;
    const respuesta3 = document.getElementById('respuesta3').value;
    const respuestaCorrecta = document.getElementById('respuestaCorrecta').value;

    if (pregunta && respuesta1 && respuesta2 && respuesta3) {
        preguntas.push({ pregunta, respuestas: [respuesta1, respuesta2, respuesta3], respuestaCorrecta });
        updateEstados();
        clearForm();
    } else {
        alert('Por favor, completa todos los campos.');
    }
});


// Este for loop agrega un event listener a cada uno de los estados (preguntas) que se muestran en la interfaz.
// Cuando se hace click en uno de los estados, se abre el modal de edición con la información de la pregunta seleccionada.
for (let i = 0; i < estados.length; i++) {
    estados[i].addEventListener('click', function() {
        if (preguntas[i]) {
            // Guarda el índice de la pregunta que se está editando y abre el modal
            currentEditIndex = i;
            openEditModal(preguntas[i]);
        }
    });
}

saveEditBtn.addEventListener('click', function() {
    const pregunta = document.getElementById('edit-pregunta').value;
    const respuesta1 = document.getElementById('edit-respuesta1').value;
    const respuesta2 = document.getElementById('edit-respuesta2').value;
    const respuesta3 = document.getElementById('edit-respuesta3').value;
    const respuestaCorrecta = document.getElementById('edit-respuestaCorrecta').value;

    if (pregunta && respuesta1 && respuesta2 && respuesta3) {
        // Actualiza la pregunta en el array de preguntas y cierra el modal
        preguntas[currentEditIndex] = { pregunta, respuestas: [respuesta1, respuesta2, respuesta3], respuestaCorrecta };
        closeEditModal();
        updateEstados();
    } else {
        alert('Por favor, completa todos los campos.');
    }
});

form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (preguntas.length === 10) {
        // Aquí puedes enviar el quiz a la base de datos
        console.log('Enviando quiz:', preguntas);
    } else {
        alert('Debe agregar 10 preguntas antes de enviar el quiz.');
    }
});

function updateEstados() {
    for (let i = 0; i < estados.length; i++) {
        // Aquí decimos que si hay una pregunta en la posición i, 
        // entonces el estado de esa pregunta es "checked", de lo contrario, es "not-checked"
        if (preguntas[i]) {
            estados[i].classList.remove('not-checked');
            estados[i].classList.add('checked');
        } else {
            estados[i].classList.remove('checked');
            estados[i].classList.add('not-checked');
        }
    }
    // Habilita el botón de crear quiz si hay 10 preguntas
    createQuizBtn.disabled = preguntas.length !== 10;
}

// Esta función limpia los campos del formulario de preguntas después de agregar una pregunta.
function clearForm() {
    document.getElementById('pregunta').value = '';
    document.getElementById('respuesta1').value = '';
    document.getElementById('respuesta2').value = '';
    document.getElementById('respuesta3').value = '';
}

// Esta función abre el modal de edición con la información de la pregunta seleccionada.
function openEditModal(preguntaData) {
    document.getElementById('edit-pregunta').value = preguntaData.pregunta;
    document.getElementById('edit-respuesta1').value = preguntaData.respuestas[0];
    document.getElementById('edit-respuesta2').value = preguntaData.respuestas[1];
    document.getElementById('edit-respuesta3').value = preguntaData.respuestas[2];
    document.getElementById('edit-respuestaCorrecta').value = preguntaData.respuestaCorrecta;
    modal.style.display = 'block';
}

function closeEditModal() {
    modal.style.display = 'none';
}

const quizData = {
    nombreQuiz: document.getElementById('nombreQuiz').value,
    categoria: document.getElementById('categoria').value, // Asume que tienes el id_categoria
    clase: 'clase_id_aqui', // Asume que tienes el id_clase
    preguntas: [
        {
            pregunta: "Pregunta 1",
            respuestas: ["Respuesta 1", "Respuesta 2", "Respuesta 3"],
            correcta: 0 // Índice de la respuesta correcta
        },
        // Más preguntas aquí
    ]
};

// Simulamos la función para generar un ID único (en una base de datos real, este sería autogenerado)
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Insertar datos en la tabla quizzes
const id_quiz = generateUniqueId(); // En una base de datos real, obtendrás este ID después de la inserción
const insertQuizQuery = `INSERT INTO quizzes (id_quiz, Nombre, id_clase, id_categoria) VALUES ('${id_quiz}', '${quizData.nombreQuiz}', '${quizData.clase}', '${quizData.categoria}');`;

// Array para almacenar las queries de inserción de preguntas y respuestas
let insertQueries = [insertQuizQuery];

quizData.preguntas.forEach((pregunta, index) => {
    const id_pregunta = generateUniqueId();
    const insertPreguntaQuery = `INSERT INTO preguntas (id_pregunta, Contenido, id_quiz) VALUES ('${id_pregunta}', '${pregunta.pregunta}', '${id_quiz}');`;
    insertQueries.push(insertPreguntaQuery);

    pregunta.respuestas.forEach((respuesta, idx) => {
        const id_respuesta = generateUniqueId();
        const valor = idx === pregunta.correcta ? 1 : 0;
        const insertRespuestaQuery = `INSERT INTO respuestas (id_respuesta, Contenido, id_pregunta, Valor) VALUES ('${id_respuesta}', '${respuesta}', '${id_pregunta}', ${valor});`;
        insertQueries.push(insertRespuestaQuery);
    });
});