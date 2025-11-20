import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Users, Plus, Search, Calculator, Pencil, Trash2, X, Save, Sun } from 'lucide-react';
import useTheme from './hooks/useTheme';
import './App.css';

function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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
    } catch (error) { console.error(error); }
  };

  const fetchPromedio = async () => {
    try {
      const res = await fetch(`${API_URL}/empleados/promedio-salario`);
      const data = await res.json();
      setPromedio(data.promedio);
    } catch (error) { console.error(error); }
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
        title: '¡Éxito!', text: 'Operación realizada correctamente', icon: 'success', timer: 1500, showConfirmButton: false
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
      title: '¿Borrar?', text: "No podrás revertir esto", icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, borrar', confirmButtonColor: '#ef4444'
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
        <div className="header-left">
          <div className="header-icon-box">
            <Users size={28} />
          </div>
          <h1>Gestión de Empleados</h1>
        </div>

        <div className="header-right">
           <select className="theme-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
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
            {mostrarFormulario ? <X size={20} /> : <Plus size={20} />}
            {mostrarFormulario ? 'Cerrar' : 'Nuevo'}
          </button>
        </div>
      </div>

      {/* FORMULARIO (Colapsable) */}
      {mostrarFormulario && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--accent-color)' }}>
            {editandoId ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
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

      {/* TARJETA PRINCIPAL CON TABLA */}
      <div className="card">
        {/* BARRA DE HERRAMIENTAS */}
        <div className="toolbar">
            <div className="search-box">
                <Search className="search-icon" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar por departamento..." 
                  value={filtroDepto}
                  onChange={(e) => setFiltroDepto(e.target.value)}
                />
            </div>
            <button className="btn btn-secondary" onClick={fetchPromedio}>
              <Calculator size={18} /> Promedio Salarial
              {promedio && <span style={{ marginLeft: '8px', fontWeight: 'bold', color: 'var(--accent-color)' }}>${parseFloat(promedio).toFixed(2)}</span>}
            </button>
        </div>

        {/* TABLA */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Cargo</th>
                <th>Departamento</th>
                <th>Salario</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.length > 0 ? (
                empleados.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{emp.nombres} {emp.apellidos}</div>
                    </td>
                    <td>{emp.cargo}</td>
                    <td>
                      <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
                        {emp.departamento}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>${emp.salario}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-icon edit" onClick={() => iniciarEdicion(emp)} title="Editar"><Pencil size={18}/></button>
                      <button className="btn-icon delete" onClick={() => handleEliminar(emp.id)} title="Eliminar"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No hay empleados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App;