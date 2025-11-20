const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- RUTA 1: LEER (READ) con Filtro ---
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

// --- RUTA 2: PROMEDIO SALARIO ---
app.get('/empleados/promedio-salario', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT AVG(salario) as promedio FROM empleados');
        res.json({ promedio: rows[0].promedio }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTA 3: CREAR (CREATE) ---
app.post('/empleados', async (req, res) => {
    const { nombres, apellidos, cargo, salario, departamento } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO empleados (nombres, apellidos, cargo, salario, departamento) VALUES (?, ?, ?, ?, ?)',
            [nombres, apellidos, cargo, salario, departamento]
        );
        res.json({ id: result.insertId, message: 'Empleado creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTA 4: ACTUALIZAR (UPDATE) ---
app.put('/empleados/:id', async (req, res) => {
    const { id } = req.params;
    const { nombres, apellidos, cargo, salario, departamento } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE empleados SET nombres=?, apellidos=?, cargo=?, salario=?, departamento=? WHERE id=?',
            [nombres, apellidos, cargo, salario, departamento, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }
        
        res.json({ message: 'Empleado actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTA 5: ELIMINAR (DELETE) ---
app.delete('/empleados/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM empleados WHERE id=?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }
        
        res.json({ message: 'Empleado eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});