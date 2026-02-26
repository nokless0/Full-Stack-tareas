import React, { useState, useEffect } from 'react';
import './index.css';

const API_URL = '/api';
const TIEMPO_EXPIRACION = 60 * 60 * 1000; // 1 hora en ms

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', precio: '', cantidad: '' });
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [esRegistro, setEsRegistro] = useState(false);

  useEffect(() => {
    if (token) {
      const expira = localStorage.getItem('tokenExpira');
      if (expira && Date.now() > parseInt(expira)) {
        logout('Tu sesión ha expirado. Inicia sesión novamente.');
        return;
      }
      fetchProductos();
    }
  }, [token]);

  const autenticar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    const endpoint = esRegistro ? 'registrar' : 'login';
    try {
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setCargando(false); return; }
      const tiempoExpiracion = Date.now() + TIEMPO_EXPIRACION;
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('tokenExpira', tiempoExpiracion.toString());
      setToken(data.token);
      setUsername(data.username);
    } catch (err) { setError('Error de conexión'); }
    setCargando(false);
  };

  const logout = (mensaje = '') => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('tokenExpira');
    setToken(null);
    setUsername('');
    setProductos([]);
    if (mensaje) setError(mensaje);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    const url = editando ? `${API_URL}/productos/${editando}` : `${API_URL}/productos`;
    const method = editando ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) { setError('Error al guardar'); setCargando(false); return; }
      setFormData({ nombre: '', descripcion: '', precio: '', cantidad: '' });
      setMostrarForm(false);
      setEditando(null);
      fetchProductos();
    } catch (err) { setError('Error de conexión'); }
    setCargando(false);
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    setCargando(true);
    try {
      await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProductos();
    } catch (err) { setError('Error al eliminar'); }
    setCargando(false);
  };

  const editar = (producto) => {
    setFormData({ nombre: producto.nombre, descripcion: producto.descripcion, precio: producto.precio, cantidad: producto.cantidad });
    setEditando(producto._id);
    setMostrarForm(true);
  };

  const cancelar = () => {
    setFormData({ nombre: '', descripcion: '', precio: '', cantidad: '' });
    setMostrarForm(false);
    setEditando(null);
    setError('');
  };

  const fetchProductos = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/productos`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { logout('Tu sesión ha expirado'); return; }
      const data = await res.json();
      setProductos(data);
    } catch (err) { setError('Error al cargar productos'); }
    setCargando(false);
  };

  if (!token) {
    return (
      <div className="login-box">
        <h2>{esRegistro ? 'Crear Cuenta' : 'Bienvenido'}</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={autenticar}>
          <input type="text" placeholder="Usuario" value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} required />
          <input type="password" placeholder="Contraseña" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} required />
          <button type="submit" disabled={cargando}>
            {cargando ? 'Cargando...' : (esRegistro ? 'Registrarse' : 'Entrar')}
          </button>
          <button type="button" className="secondary" onClick={() => { setEsRegistro(!esRegistro); setError(''); }}>
            {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📦 Mis Productos</h1>
        <button className="logout" onClick={() => logout()}>Cerrar sesión</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <button className="btn-nuevo" onClick={() => mostrarForm ? cancelar() : setMostrarForm(true)} disabled={cargando}>
        {mostrarForm ? '✕ Cancelar' : '+ Nuevo Producto'}
      </button>

      {mostrarForm && (
        <div className="form-box">
          <h2>{editando ? '✏️ Editar' : '➕ Nuevo'} Producto</h2>
          <form onSubmit={handleSubmit}>
            <input placeholder="Nombre del producto" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
            <input placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} required />
            <div style={{display: 'flex', gap: '10px'}}>
              <input type="number" placeholder="Precio ($)" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} required style={{flex: 1}} />
              <input type="number" placeholder="Cantidad" value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: e.target.value})} required style={{flex: 1}} />
            </div>
            <button type="submit" disabled={cargando}>
              {cargando ? 'Guardando...' : (editando ? 'Actualizar Producto' : 'Crear Producto')}
            </button>
          </form>
        </div>
      )}

      {cargando && productos.length === 0 ? (
        <p style={{textAlign: 'center', color: 'white'}}>Cargando...</p>
      ) : productos.length === 0 ? (
        <div style={{textAlign: 'center', color: 'white', marginTop: '40px'}}>
          <p style={{fontSize: '1.2rem'}}>No hay productos todavía</p>
          <p>¡Crea tu primer producto!</p>
        </div>
      ) : 
        productos.map(p => (
          <div key={p._id} className="card">
            <div className="card-row">
              <div className="card-info">
                <strong>{p.nombre}</strong>
                <p className="desc">{p.descripcion}</p>
                <p className="precio">${p.precio} &nbsp;|&nbsp; Cant: {p.cantidad}</p>
              </div>
              <div className="card-actions">
                <button onClick={() => editar(p)}>Editar</button>
                <button className="danger" onClick={() => eliminar(p._id)}>Eliminar</button>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

export default App;
