// ==================== APP PRINCIPAL ====================
// Punto de entrada de la aplicación React

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InactivityWarning, PrivateRoute } from './components/UI';
import api from './services/api';

// ==================== PÁGINA LOGIN ====================

function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/citas');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🐕</span>
          <h2>Iniciar Sesión</h2>
          <p className="auth-subtitle">Bienvenido de nuevo</p>
        </div>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary">Iniciar Sesión</button>
        </form>
        <p className="auth-footer">¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
      </div>
    </div>
  );
}

// ==================== PÁGINA REGISTRO ====================

function Register() {
  const [nombre, setNombre] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [adminKey, setAdminKey] = React.useState('');
  const [esAdmin, setEsAdmin] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (esAdmin) {
        // Registrar como admin
        const res = await api.post('/auth/register-admin', { nombre, email, password, adminKey });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } else {
        // Registrar normal
        const res = await api.post('/auth/register', { nombre, email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      navigate('/citas');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🐕</span>
          <h2>Crear Cuenta</h2>
          <p className="auth-subtitle">Únete a VetCare</p>
        </div>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          {/* Opción para registro de admin */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="esAdmin" 
              checked={esAdmin} 
              onChange={e => setEsAdmin(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <label htmlFor="esAdmin" style={{ marginBottom: 0 }}>¿Eres administrador?</label>
          </div>
          
          {esAdmin && (
            <div className="form-group">
              <label>Clave de Admin</label>
              <input 
                type="password" 
                placeholder="Clave secreta" 
                value={adminKey} 
                onChange={e => setAdminKey(e.target.value)}
                required={esAdmin}
              />
            </div>
          )}
          
          <button type="submit" className="btn-primary">Crear Cuenta</button>
        </form>
        <p className="auth-footer">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
}

// ==================== PÁGINA DASHBOARD ====================

function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="dashboard">
      <div className="welcome-card">
        <div className="welcome-icon">👋</div>
        <h2>Hola, {user?.nombre}!</h2>
        <p>¿Qué te gustaría hacer hoy?</p>
      </div>
      
      <div className="dashboard-grid">
        <Link to="/citas" className="dashboard-card">
          <div className="card-icon">📋</div>
          <h3>Mis Citas</h3>
          <p>Ver todas mis citas programadas</p>
        </Link>
        
        <Link to="/citas/nueva" className="dashboard-card primary">
          <div className="card-icon">➕</div>
          <h3>Nueva Cita</h3>
          <p>Agendar una nueva cita</p>
        </Link>
      </div>

      {user?.rol === 'admin' && (
        <div className="admin-notice">
          <span>👑</span> Tienes acceso de administrador
        </div>
      )}
    </div>
  );
}

// ==================== PÁGINA CITAS ====================

function Citas() {
  const [citas, setCitas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const cargarCitas = async () => {
    try {
      const res = await api.get('/citas');
      setCitas(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  React.useEffect(() => { cargarCitas(); }, []);

  const eliminar = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    await api.delete(`/citas/${id}`);
    cargarCitas();
  };

  const cambiarEstado = async (id, estado) => {
    await api.patch(`/citas/${id}/status`, { estado });
    cargarCitas();
  };

  if (loading) return <div className="loading">Cargando citas...</div>;

  return (
    <div className="citas-page">
      <div className="page-header">
        <h2>Mis Citas</h2>
        <button className="btn-success" onClick={() => navigate('/citas/nueva')}>➕ Nueva Cita</button>
      </div>

      {citas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No hay citas</h3>
          <p>Programa tu primera cita para tu mascota</p>
          <button className="btn-primary" onClick={() => navigate('/citas/nueva')}>Crear Primera Cita</button>
        </div>
      ) : (
        <div className="citas-grid">
          {citas.map(cita => (
            <div key={cita._id} className="cita-card">
              <div className="cita-header">
                <span className="pet-icon">🐕</span>
                <div>
                  <h3>{cita.nombrePerro}</h3>
                  <span className="raza">{cita.raza}</span>
                </div>
              </div>
              
              <div className="cita-detalles">
                <p><span className="label">👤 Dueño:</span> {cita.nombreDueno}</p>
                <p><span className="label">📅 Fecha:</span> {cita.fecha}</p>
                <p><span className="label">🕐 Hora:</span> {cita.hora}</p>
                <p><span className="label">🏥 Motivo:</span> {cita.motivo}</p>
              </div>
              
              <div className="cita-footer">
                <span className={`estado estado-${cita.estado}`}>{cita.estado}</span>
                <div className="acciones">
                  {user?.rol === 'admin' && (
                    <select value={cita.estado} onChange={(e) => cambiarEstado(cita._id, e.target.value)} className="estado-select">
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmar</option>
                      <option value="completada">Completar</option>
                      <option value="cancelada">Cancelar</option>
                    </select>
                  )}
                  <button className="btn-editar" onClick={() => navigate(`/citas/editar/${cita._id}`)}>✏️ Editar</button>
                  <button className="btn-eliminar" onClick={() => eliminar(cita._id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== PÁGINA CREAR CITA ====================

function CrearCita() {
  const [formData, setFormData] = React.useState({
    nombreDueno: '',
    nombrePerro: '',
    raza: '',
    fecha: '',
    hora: '',
    motivo: 'consulta'
  });
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/citas', formData);
      navigate('/citas');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cita');
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>📅 Nueva Cita</h2>
        <p className="form-subtitle">Completa los datos de la cita</p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre del Dueño</label>
              <input name="nombreDueno" value={formData.nombreDueno} onChange={handleChange} placeholder="Nombre del propietario" required />
            </div>
            <div className="form-group">
              <label>Nombre de la Mascota</label>
              <input name="nombrePerro" value={formData.nombrePerro} onChange={handleChange} placeholder="Nombre del perro" required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Raza</label>
            <input name="raza" value={formData.raza} onChange={handleChange} placeholder="Ej: Golden Retriever" required />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input type="time" name="hora" value={formData.hora} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Tipo de Cita</label>
            <select name="motivo" value={formData.motivo} onChange={handleChange}>
              <option value="consulta">🩺 Consulta General</option>
              <option value="vacunacion">💉 Vacunación</option>
              <option value="cirugia">🏥 Cirugía</option>
              <option value="urgencia">🚨 Urgencia</option>
              <option value="chequeo">✅ Chequeo Preventivo</option>
            </select>
          </div>
          
          <div className="form-buttons">
            <button type="submit" className="btn-primary">✅ Crear Cita</button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/citas')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== PÁGINA EDITAR CITA ====================

function EditarCita() {
  const [formData, setFormData] = React.useState(null);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const id = window.location.pathname.split('/').pop();

  React.useEffect(() => {
    const fetchCita = async () => {
      try {
        const res = await api.get(`/citas/${id}`);
        const cita = res.data;
        setFormData({
          nombreDueno: cita.nombreDueno,
          nombrePerro: cita.nombrePerro,
          raza: cita.raza,
          fecha: cita.fecha,
          hora: cita.hora,
          motivo: cita.motivo
        });
      } catch (err) {
        alert('Error al cargar la cita');
        navigate('/citas');
      }
    };
    fetchCita();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/citas/${id}`, formData);
      navigate('/citas');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar');
    }
  };

  if (!formData) return <div className="loading">Cargando...</div>;

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>✏️ Editar Cita</h2>
        <p className="form-subtitle">Modifica los datos de la cita</p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre del Dueño</label>
              <input name="nombreDueno" value={formData.nombreDueno} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Nombre de la Mascota</label>
              <input name="nombrePerro" value={formData.nombrePerro} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Raza</label>
            <input name="raza" value={formData.raza} onChange={handleChange} required />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input type="time" name="hora" value={formData.hora} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Tipo de Cita</label>
            <select name="motivo" value={formData.motivo} onChange={handleChange}>
              <option value="consulta">🩺 Consulta General</option>
              <option value="vacunacion">💉 Vacunación</option>
              <option value="cirugia">🏥 Cirugía</option>
              <option value="urgencia">🚨 Urgencia</option>
              <option value="chequeo">✅ Chequeo Preventivo</option>
            </select>
          </div>
          
          <div className="form-buttons">
            <button type="submit" className="btn-primary">💾 Guardar Cambios</button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/citas')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== COMPONENTE NAVBAR ====================

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <span className="brand-icon">🐕</span>
          <span className="brand-text">VetCare</span>
        </Link>
      </div>
      {user && (
        <div className="navbar-menu">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/citas" className="nav-link">Mis Citas</Link>
          <Link to="/citas/nueva" className="nav-link btn-nueva">+ Nueva Cita</Link>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>
      )}
    </nav>
  );
}

// ==================== APP PRINCIPAL ====================

// Componente interno que tiene acceso al contexto
function AppContent() {
  const { inactivityWarning } = useAuth();
  
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        {inactivityWarning && <InactivityWarning />}
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/citas" element={<PrivateRoute><Citas /></PrivateRoute>} />
            <Route path="/citas/nueva" element={<PrivateRoute><CrearCita /></PrivateRoute>} />
            <Route path="/citas/editar/:id" element={<PrivateRoute><EditarCita /></PrivateRoute>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

// Componente App que envuelve todo en AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
