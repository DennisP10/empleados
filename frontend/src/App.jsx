import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
// 👇 AQUÍ ESTÁ LA CORRECCIÓN: Agregué 'Users' y todos los demás iconos necesarios
import { Users, Plus, Search, Calculator, Pencil, Trash2, X, Save, DollarSign, Sun, Moon, Eye } from 'lucide-react';
import useTheme from './hooks/useTheme';
import './App.css';

function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  // Hook del tema
  const [theme, setTheme] = useTheme();

  const [empleados, setEmpleados] = useState([]);
  const [filtroDepto, setFiltroDepto] = useState('');
  const [promedio, setPromedio] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', cargo: '', salario: '', departamento: ''
  });
  const [editandoId, setEditandoId] = useState(null);

  // --- LECTURA ---
  const fetchEmpleados = async () => {
    let url = `${API_URL}/empleados`;
    if (filtroDepto) url += `?departamento=${filtroDepto}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setEmpleados(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPromedio = async () => {
    try {
      const res = await fetch(`${API_URL}/empleados/promedio-salario`);
      const data = await res.json();
      setPromedio(data.promedio);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchEmpleados(); }, []);

  // --- FORMULARIO ---
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
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Operación realizada correctamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      setFormData({ nombres: '', apellidos: '', cargo: '', salario: '', departamento: '' });
      setEditandoId(null);
      setMostrarFormulario(false);
      fetchEmpleados();
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema', 'error');
    }
  };

  const iniciarEdicion = (emp) => {
    setEditandoId(emp.id);
    setFormData({ ...emp });
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Borrar?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await fetch(`${API_URL}/empleados/${id}`, { method: 'DELETE' });
      fetchEmpleados();
      Swal.fire('Eliminado', '', 'success');
    }
  };

  return (
    <div className="container">
      {/* HEADER */}
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="header-icon-box">
            <Users size={24} />
          </div>
          <h1>Gestión de Empleados</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
           {/* SELECTOR DE TEMA */}
           <select 
              className="theme-select"
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
           >
              <option value="light">🌞 Claro</option>
              <option value="dark">🌙 Oscuro</option>
              <option value="high-contrast">👁️ Alto Contraste</option>
           </select>

          <button 
            className="btn btn-primary"
            onClick={() => {
              setMostrarFormulario(!mostrarFormulario);
              setEditandoId(null);
              setFormData({ nombres: '', apellidos: '', cargo: '', salario: '', departamento: '' });
            }}
          >
            {mostrarFormulario ? <X size={18} /> : <Plus size={18} />}
            {mostrarFormulario ? 'Cerrar' : 'Nuevo'}
          </button>
        </div>
      </div>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <div className="card animate-fade-in">
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
            {editandoId ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group"><input name="nombres" placeholder="Nombres" value={formData.nombres} onChange={handleChange} required /></div>
              <div className="input-group"><input name="apellidos" placeholder="Apellidos" value={formData.apellidos} onChange={handleChange} required /></div>
              <div className="input-group"><input name="cargo" placeholder="Cargo" value={formData.cargo} onChange={handleChange} required /></div>
              <div className="input-group"><input name="departamento" placeholder="Departamento" value={formData.departamento} onChange={handleChange} required /></div>
              <div className="input-group"><input name="salario" type="number" placeholder="Salario" value={formData.salario} onChange={handleChange} required /></div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={18} /> Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLA */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div className="input-group">
                <Search size={18} style={{ marginLeft: '10px' }} />
                <input 
                  style={{ paddingLeft: '35px' }}
                  placeholder="Buscar Depto..." 
                  value={filtroDepto}
                  onChange={(e) => setFiltroDepto(e.target.value)}
                />
            </div>
            <button className="btn btn-secondary" onClick={fetchPromedio}>
              <Calculator size={18} /> Promedio
              {promedio && <span style={{ marginLeft: '5px' }}>(${parseFloat(promedio).toFixed(2)})</span>}
            </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Empleado</th><th>Cargo</th><th>Depto</th><th>Salario</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.nombres} {emp.apellidos}</td>
                  <td>{emp.cargo}</td>
                  <td><span className="badge">{emp.departamento}</span></td>
                  <td>${emp.salario}</td>
                  <td>
                    <button className="btn-icon edit" onClick={() => iniciarEdicion(emp)}><Pencil size={18}/></button>
                    <button className="btn-icon delete" onClick={() => handleEliminar(emp.id)}><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App;