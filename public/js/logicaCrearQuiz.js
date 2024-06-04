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

for (let i = 0; i < estados.length; i++) {
    estados[i].addEventListener('click', function() {
        if (preguntas[i]) {
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
        const quizData = {
            nombreQuiz: document.getElementById('nombreQuiz').value,
            categoria: document.getElementById('categoria').value,
            id_clase: document.querySelector('input[name="id_clase"]').value,
            preguntas: preguntas
        };
        
        console.log('Enviando quiz:', quizData);

        fetch('/quizzes/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quizData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.href = '/professor'; // Redirige al profesor después de crear el quiz
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        alert('Debe agregar 10 preguntas antes de enviar el quiz.');
    }
});

function updateEstados() {
    for (let i = 0; i < estados.length; i++) {
        if (preguntas[i]) {
            estados[i].classList.remove('not-checked');
            estados[i].classList.add('checked');
        } else {
            estados[i].classList.remove('checked');
            estados[i].classList.add('not-checked');
        }
    }
    createQuizBtn.disabled = preguntas.length !== 10;
}

function clearForm() {
    document.getElementById('pregunta').value = '';
    document.getElementById('respuesta1').value = '';
    document.getElementById('respuesta2').value = '';
    document.getElementById('respuesta3').value = '';
}

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
