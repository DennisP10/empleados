const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors()); // Importante para que Vercel se comunique con Render
app.use(express.json());

// 1. Obtener empleados (con filtro opcional por departamento)
app.get('/empleados', async (req, res) => {
    const { departamento } = req.query;
    try {
        let query = 'SELECT * FROM empleados';
        let params = [];

        if (departamento) {
            query += ' WHERE departamento = ?';
            params.push(departamento);
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Promedio de salario
app.get('/empleados/promedio-salario', async (req, res) => {
    try {
        // Si quieres promedio general:
        const query = 'SELECT AVG(salario) as promedio FROM empleados';

        // Si quisieras promedio filtrado por depto (opcional):
        // const query = 'SELECT AVG(salario) as promedio FROM empleados WHERE departamento = ?';

        const [rows] = await db.query(query);
        // Retornamos un objeto simple
        res.json({ promedio: rows[0].promedio }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Extra: Crear empleado (para probar)
app.post('/empleados', async (req, res) => {
    const { nombres, apellidos, cargo, salario, departamento } = req.body;
    try {
        await db.query(
            'INSERT INTO empleados (nombres, apellidos, cargo, salario, departamento) VALUES (?, ?, ?, ?, ?)',
            [nombres, apellidos, cargo, salario, departamento]
        );
        res.json({ message: 'Empleado creado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});