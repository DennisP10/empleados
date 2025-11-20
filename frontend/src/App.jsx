import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [empleados, setEmpleados] = useState([]);
  const [departamento, setDepartamento] = useState('');
  const [promedio, setPromedio] = useState(null);

  // Cambia esto por la URL de Render cuando despliegues
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

  // Cargar empleados (con o sin filtro)
  const fetchEmpleados = async () => {
    let url = `${API_URL}/empleados`;
    if (departamento) {
      url += `?departamento=${departamento}`;
    }
    try {
      const res = await fetch(url);
      const data = await res.json();
      setEmpleados(data);
    } catch (error) {
      console.error("Error cargando empleados", error);
    }
  };

  // Cargar promedio
  const fetchPromedio = async () => {
    try {
      const res = await fetch(`${API_URL}/empleados/promedio-salario`);
      const data = await res.json();
      setPromedio(data.promedio);
    } catch (error) {
      console.error("Error cargando promedio", error);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []); // Carga inicial

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Gestión de Empleados</h1>

      {/* Sección de Filtros */}
      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>Filtros y Estadísticas</h3>
        <input 
          type="text" 
          placeholder="Filtrar por departamento (ej: Sistemas)" 
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
        />
        <button onClick={fetchEmpleados} style={{ marginLeft: '10px' }}>
          Buscar
        </button>

        <button onClick={fetchPromedio} style={{ marginLeft: '10px', backgroundColor: '#4CAF50', color: 'white' }}>
          Calcular Promedio Salarial Global
        </button>

        {promedio && (
          <p><strong>Promedio de Salarios:</strong> ${parseFloat(promedio).toFixed(2)}</p>
        )}
      </div>

      {/* Tabla de Resultados */}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Cargo</th>
            <th>Departamento</th>
            <th>Salario</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map(emp => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.nombres}</td>
              <td>{emp.apellidos}</td>
              <td>{emp.cargo}</td>
              <td>{emp.departamento}</td>
              <td>${emp.salario}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App