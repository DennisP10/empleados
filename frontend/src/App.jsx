import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Estados para los datos y la UI
  const [empleados, setEmpleados] = useState([]);
  const [filtroDepto, setFiltroDepto] = useState('');
  const [promedio, setPromedio] = useState(null);
  
  // Estado para el formulario (Crear/Editar)
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', cargo: '', salario: '', departamento: ''
  });
  const [editandoId, setEditandoId] = useState(null); // Si es null, estamos creando. Si tiene ID, estamos editando.

  // --- LECTURA DE DATOS ---
  const fetchEmpleados = async () => {
    let url = `${API_URL}/empleados`;
    if (filtroDepto) url += `?departamento=${filtroDepto}`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      setEmpleados(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchPromedio = async () => {
    const res = await fetch(`${API_URL}/empleados/promedio-salario`);
    const data = await res.json();
    setPromedio(data.promedio);
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  // --- MANEJO DEL FORMULARIO ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editandoId ? 'PUT' : 'POST';
    const url = editandoId ? `${API_URL}/empleados/${editandoId}` : `${API_URL}/empleados`;

    try {
      await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      // Resetear formulario y recargar tabla
      setFormData({ nombres: '', apellidos: '', cargo: '', salario: '', departamento: '' });
      setEditandoId(null);
      fetchEmpleados();
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  // --- ACCIONES DE TABLA ---
  const handleEditar = (emp) => {
    setEditandoId(emp.id);
    setFormData({
      nombres: emp.nombres,
      apellidos: emp.apellidos,
      cargo: emp.cargo,
      salario: emp.salario,
      departamento: emp.departamento
    });
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;
    
    try {
      await fetch(`${API_URL}/empleados/${id}`, { method: 'DELETE' });
      fetchEmpleados();
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setFormData({ nombres: '', apellidos: '', cargo: '', salario: '', departamento: '' });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Gestión de Empleados (CRUD)</h1>

      {/* FORMULARIO DE CREACIÓN / EDICIÓN */}
      <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>{editandoId ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input name="nombres" placeholder="Nombres" value={formData.nombres} onChange={handleChange} required />
          <input name="apellidos" placeholder="Apellidos" value={formData.apellidos} onChange={handleChange} required />
          <input name="cargo" placeholder="Cargo" value={formData.cargo} onChange={handleChange} required />
          <input name="departamento" placeholder="Departamento" value={formData.departamento} onChange={handleChange} required />
          <input name="salario" type="number" placeholder="Salario" value={formData.salario} onChange={handleChange} required />
          
          <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
            <button type="submit" style={{ background: editandoId ? '#ff9800' : '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>
              {editandoId ? 'Actualizar Empleado' : 'Guardar Empleado'}
            </button>
            {editandoId && (
              <button type="button" onClick={handleCancelarEdicion} style={{ marginLeft: '10px', padding: '10px' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* FILTROS Y ESTADÍSTICAS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <input 
            type="text" 
            placeholder="Filtrar por Depto..." 
            value={filtroDepto}
            onChange={(e) => setFiltroDepto(e.target.value)}
            style={{ padding: '8px' }}
          />
          <button onClick={fetchEmpleados} style={{ marginLeft: '5px', padding: '8px' }}>Buscar</button>
        </div>
        <div>
          <button onClick={fetchPromedio} style={{ background: '#2196F3', color: 'white', padding: '8px', border: 'none' }}>
            Ver Promedio Salarial
          </button>
          {promedio && <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>${parseFloat(promedio).toFixed(2)}</span>}
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead style={{ background: '#333', color: '#fff' }}>
          <tr>
            <th>Nombres</th>
            <th>Cargo</th>
            <th>Depto</th>
            <th>Salario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map(emp => (
            <tr key={emp.id}>
              <td>{emp.nombres} {emp.apellidos}</td>
              <td>{emp.cargo}</td>
              <td>{emp.departamento}</td>
              <td>${emp.salario}</td>
              <td style={{ textAlign: 'center' }}>
                <button onClick={() => handleEditar(emp)} style={{ marginRight: '5px', cursor: 'pointer' }}>✏️</button>
                <button onClick={() => handleEliminar(emp.id)} style={{ color: 'red', cursor: 'pointer' }}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App