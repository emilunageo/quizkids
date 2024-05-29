const db = require('../config/db');

exports.createQuiz = async (req, res) => {
    const { nombreQuiz, id_clase, id_categoria, preguntas } = req.body;

    try {
        // Iniciar una transacción
        const conn = await db.getConnection();
        await conn.beginTransaction();

        // Insertar el quiz
        const [quizResult] = await conn.query('INSERT INTO Quizes (nombre, id_clase, id_categoria) VALUES (?, ?, ?)', [nombreQuiz, id_clase, id_categoria]);
        const id_quiz = quizResult.insertId;

        // Insertar preguntas y respuestas
        for (const pregunta of preguntas) {
            const [preguntaResult] = await conn.query('INSERT INTO Preguntas (id_quiz, contenido) VALUES (?, ?)', [id_quiz, pregunta.pregunta]);
            const id_pregunta = preguntaResult.insertId;

            for (const [index, respuesta] of pregunta.respuestas.entries()) {
                const valor = (index === pregunta.correcta) ? 1 : 0;
                await conn.query('INSERT INTO Respuestas (id_pregunta, contenido, valor) VALUES (?, ?, ?)', [id_pregunta, respuesta, valor]);
            }
        }

        // Confirmar la transacción
        await conn.commit();
        conn.release();

        res.status(201).json({ message: 'Quiz creado exitosamente.' });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error al crear el quiz.' });
    }
};
