import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import apiService from '../services/api';

const AdminUsersPanel = () => {
  const { theme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState('usuarios');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    rol: 'administrador'
  });
  const [userCiDisplay, setUserCiDisplay] = useState('');

  // Estados para docentes
  const [docentes, setDocentes] = useState([]);
  const [showDocenteModal, setShowDocenteModal] = useState(false);
  const [editingDocente, setEditingDocente] = useState(null);
  const [docenteForm, setDocenteForm] = useState({
    ci_doc: '',
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    especialidad_doc: ''
  });

  // Estados para estudiantes
  const [estudiantes, setEstudiantes] = useState([]);
  const [showEstudianteModal, setShowEstudianteModal] = useState(false);
  const [editingEstudiante, setEditingEstudiante] = useState(null);
  const [estudianteForm, setEstudianteForm] = useState({
    ci_est: '',
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    carrera: '',
    semestre: 1
  });

  // Cargar datos
  useEffect(() => {
    if (activeSubTab === 'usuarios') {
      loadUsuarios();
    } else if (activeSubTab === 'docentes') {
      loadDocentes();
    } else if (activeSubTab === 'estudiantes') {
      loadEstudiantes();
    }
  }, [activeSubTab]);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/usuarios');
      const usuarios = response.data || [];
      
      // Cargar CIs de estudiantes y docentes
      const [estudiantesRes, docentesRes] = await Promise.all([
        apiService.get('/estudiantes'),
        apiService.get('/docentes')
      ]);
      
      // Crear mapas de id_user -> CI
      const estudiantesMap = {};
      (estudiantesRes.data || []).forEach(est => {
        if (est.id_user && typeof est.id_user === 'object') {
          estudiantesMap[est.id_user.id_user] = est.ci_est;
        }
      });
      
      const docentesMap = {};
      (docentesRes.data || []).forEach(doc => {
        if (doc.id_user) {
          docentesMap[doc.id_user] = doc.ci_doc;
        }
      });
      
      // Agregar CI a cada usuario
      const usuariosConCI = usuarios.map(user => ({
        ...user,
        ci: user.rol === 'estudiante' ? estudiantesMap[user.id_user] : 
            user.rol === 'docente' ? docentesMap[user.id_user] : null
      }));
      
      setUsuarios(usuariosConCI);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setError('Error al cargar usuarios');
    }
    setLoading(false);
  };

  const loadDocentes = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/docentes');
      setDocentes(response.data || []);
    } catch (err) {
      console.error('Error cargando docentes:', err);
      setError('Error al cargar docentes');
    }
    setLoading(false);
  };

  const loadEstudiantes = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/estudiantes');
      setEstudiantes(response.data || []);
    } catch (err) {
      console.error('Error cargando estudiantes:', err);
      setError('Error al cargar estudiantes');
    }
    setLoading(false);
  };

  // CRUD Usuarios
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUser) {
        // Actualizar usuario existente
        await apiService.put(`/usuarios/${editingUser}`, {
          nombre: userForm.nombre,
          apellido: userForm.apellido,
          correo: userForm.correo,
          ...(userForm.contrasena && { contrasena: userForm.contrasena })
        });
        setSuccessMessage('Usuario actualizado exitosamente');
      } else {
        // Crear usuario via /auth/register (que automáticamente crea estudiante/docente)
        await apiService.post('/auth/register', userForm);
        setSuccessMessage('Usuario creado exitosamente');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowUserModal(false);
      setEditingUser(null);
      setUserCiDisplay('');
      setUserForm({ nombre: '', apellido: '', correo: '', contrasena: '', rol: 'administrador' });
      
      // Recargar la lista correspondiente
      if (activeSubTab === 'usuarios') loadUsuarios();
      if (activeSubTab === 'docentes') loadDocentes();
      if (activeSubTab === 'estudiantes') loadEstudiantes();
    } catch (err) {
      let errorMessage = 'Error al guardar usuario';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map(e => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || detail.message || JSON.stringify(detail);
        }
      }
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id_user);
    setUserForm({
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      contrasena: '',
      rol: user.rol
    });
    // Mostrar el CI de la tabla correspondiente (solo lectura)
    setUserCiDisplay(user.ci || 'N/A');
    setShowUserModal(true);
  };

  const handleDeleteUser = async (idUser) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    setLoading(true);
    try {
      await apiService.delete(`/usuarios/${idUser}`);
      setSuccessMessage('Usuario eliminado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadUsuarios();
    } catch (err) {
      let errorMessage = 'Error al eliminar usuario';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map(e => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || detail.message || JSON.stringify(detail);
        }
      }
      setError(errorMessage);
    }
    setLoading(false);
  };

  // CRUD Docentes
  const handleCreateDocente = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingDocente) {
        // Actualizar docente existente
        await apiService.put(`/docentes/${editingDocente}`, {
          especialidad_doc: docenteForm.especialidad_doc
        });
        setSuccessMessage('Docente actualizado exitosamente');
      } else {
        // Crear docente
        await apiService.post('/docentes', docenteForm);
        setSuccessMessage('Docente creado exitosamente');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowDocenteModal(false);
      setEditingDocente(null);
      setDocenteForm({ ci_doc: '', nombre: '', apellido: '', correo: '', contrasena: '', especialidad_doc: '' });
      loadDocentes();
    } catch (err) {
      let errorMessage = 'Error al guardar docente';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map(e => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || detail.message || JSON.stringify(detail);
        }
      }
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleEditDocente = (docente) => {
    setEditingDocente(docente.ci_doc);
    setDocenteForm({
      ci_doc: docente.ci_doc,
      nombre: docente.id_user?.nombre || '',
      apellido: docente.id_user?.apellido || '',
      correo: docente.id_user?.correo || '',
      contrasena: '',
      especialidad_doc: docente.especialidad_doc
    });
    setShowDocenteModal(true);
  };

  const handleDeleteDocente = async (ciDoc) => {
    if (!window.confirm('¿Estás seguro de eliminar este docente?')) return;
    setLoading(true);
    try {
      await apiService.delete(`/docentes/${ciDoc}`);
      setSuccessMessage('Docente eliminado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadDocentes();
    } catch (err) {
      let errorMessage = 'Error al eliminar docente';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map(e => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || detail.message || JSON.stringify(detail);
        }
      }
      setError(errorMessage);
    }
    setLoading(false);
  };

  // CRUD Estudiantes
  const handleCreateEstudiante = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingEstudiante) {
        // Actualizar estudiante existente
        await apiService.put(`/estudiantes/${editingEstudiante}`, {
          carrera: estudianteForm.carrera,
          semestre: estudianteForm.semestre
        });
        setSuccessMessage('Estudiante actualizado exitosamente');
      } else {
        // Crear estudiante
        await apiService.post('/estudiantes', estudianteForm);
        setSuccessMessage('Estudiante creado exitosamente');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowEstudianteModal(false);
      setEditingEstudiante(null);
      setEstudianteForm({ ci_est: '', nombre: '', apellido: '', correo: '', contrasena: '', carrera: '', semestre: 1 });
      loadEstudiantes();
    } catch (err) {
      let errorMessage = 'Error al guardar estudiante';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map(e => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || detail.message || JSON.stringify(detail);
        }
      }
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleEditEstudiante = (estudiante) => {
    setEditingEstudiante(estudiante.ci_est);
    setEstudianteForm({
      ci_est: estudiante.ci_est,
      nombre: estudiante.id_user?.nombre || '',
      apellido: estudiante.id_user?.apellido || '',
      correo: estudiante.id_user?.correo || '',
      contrasena: '',
      carrera: estudiante.carrera,
      semestre: estudiante.semestre
    });
    setShowEstudianteModal(true);
  };

  const handleDeleteEstudiante = async (ciEst) => {
    if (!window.confirm('¿Estás seguro de eliminar este estudiante?')) return;
    setLoading(true);
    try {
      await apiService.delete(`/estudiantes/${ciEst}`);
      setSuccessMessage('Estudiante eliminado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadEstudiantes();
    } catch (err) {
      let errorMessage = 'Error al eliminar estudiante';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map(e => e.msg || JSON.stringify(e)).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || detail.message || JSON.stringify(detail);
        }
      }
      setError(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div style={{
      height: 'calc(100vh - 200px)',
      overflowY: 'auto',
      paddingRight: '10px',
      paddingBottom: '60px'
    }}>
      {/* Mensajes */}
      {error && (
        <div style={{
          padding: '16px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#c33'
        }}>
          ❌ {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}
      
      {successMessage && (
        <div style={{
          padding: '16px',
          background: '#efe',
          border: '1px solid #cfc',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#3c3'
        }}>
          ✅ {successMessage}
        </div>
      )}

      {/* Sub-tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: `2px solid ${theme.colors.primaryLight}20`
      }}>
        {['usuarios', 'docentes', 'estudiantes'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            style={{
              padding: '12px 20px',
              background: activeSubTab === tab ? theme.colors.primary : 'transparent',
              color: activeSubTab === tab ? 'white' : theme.colors.text,
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: activeSubTab === tab ? '600' : '400',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'usuarios' && '👤 '}
            {tab === 'docentes' && '👨‍🏫 '}
            {tab === 'estudiantes' && '🎓 '}
            {tab}
          </button>
        ))}
      </div>

      {/* Panel de Usuarios */}
      {activeSubTab === 'usuarios' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2>Gestión de Usuarios</h2>
            <button
              onClick={() => {
                setUserForm({ nombre: '', apellido: '', correo: '', contrasena: '', rol: 'administrador' });
                setShowUserModal(true);
              }}
              style={{
                padding: '12px 28px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.opacity = '1';
              }}
            >
              <span>✨</span> Nuevo Usuario
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
              <p>Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: theme.colors.cardBackground,
              borderRadius: '12px',
              border: `2px dashed ${theme.colors.primaryLight}40`
            }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>👤</div>
              <h3 style={{ margin: '0 0 10px 0' }}>No hay usuarios</h3>
              <p style={{ opacity: 0.7 }}>Comienza creando el primer usuario</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {usuarios.map(user => (
                <div
                  key={user.id_user}
                  style={{
                    padding: '24px',
                    background: '#2c2c3e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                  }}
                >
                  <h3 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>{user.nombre} {user.apellido}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {user.ci && (
                      <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: theme.colors.primaryLight }}>📋</span>
                        <strong style={{ color: 'rgba(255,255,255,0.9)' }}>CI:</strong> {user.ci}
                      </p>
                    )}
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.colors.primaryLight }}>✉️</span>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Email:</strong> {user.correo}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.colors.primaryLight }}>👤</span>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Rol:</strong> 
                      <span style={{
                        padding: '4px 12px',
                        background: user.rol === 'administrador' ? 'rgba(231, 76, 60, 0.2)' : user.rol === 'docente' ? `${theme.colors.primary}30` : 'rgba(46, 204, 113, 0.2)',
                        color: user.rol === 'administrador' ? '#e74c3c' : user.rol === 'docente' ? theme.colors.primaryLight : '#2ecc71',
                        border: `1px solid ${user.rol === 'administrador' ? '#e74c3c' : user.rol === 'docente' ? theme.colors.primaryLight : '#2ecc71'}40`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>{user.rol}</span>
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Estado:</strong> {user.activo ? '✅ Activo' : '❌ Inactivo'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      onClick={() => handleEditUser(user)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#ffffff',
                        border: `1px solid ${theme.colors.primaryLight}50`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = `${theme.colors.primary}30`;
                        e.target.style.borderColor = theme.colors.primaryLight;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.1)';
                        e.target.style.borderColor = `${theme.colors.primaryLight}50`;
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id_user)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'rgba(231, 76, 60, 0.15)',
                        color: '#ff6b6b',
                        border: '1px solid rgba(231, 76, 60, 0.3)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(231, 76, 60, 0.25)';
                        e.target.style.borderColor = '#e74c3c';
                        e.target.style.color = '#ff5252';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(231, 76, 60, 0.15)';
                        e.target.style.borderColor = 'rgba(231, 76, 60, 0.3)';
                        e.target.style.color = '#ff6b6b';
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel de Docentes */}
      {activeSubTab === 'docentes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2>Gestión de Docentes</h2>
            <button
              onClick={() => setShowDocenteModal(true)}
              style={{
                padding: '12px 28px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.opacity = '1';
              }}
            >
              <span>✨</span> Nuevo Docente
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
              <p>Cargando docentes...</p>
            </div>
          ) : docentes.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: theme.colors.cardBackground,
              borderRadius: '12px',
              border: `2px dashed ${theme.colors.primaryLight}40`
            }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>👨‍🏫</div>
              <h3 style={{ margin: '0 0 10px 0' }}>No hay docentes</h3>
              <p style={{ opacity: 0.7 }}>Comienza registrando el primer docente</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {docentes.map(docente => (
                <div
                  key={docente.ci_doc}
                  style={{
                    padding: '24px',
                    background: '#2c2c3e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                  }}
                >
                  <h3 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>{docente.id_user?.nombre} {docente.id_user?.apellido}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.colors.primaryLight }}>📋</span>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>CI:</strong> {docente.ci_doc}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.colors.primaryLight }}>✉️</span>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Email:</strong> {docente.id_user?.correo}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.colors.primaryLight }}>🎓</span>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Especialidad:</strong> {docente.especialidad_doc}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      onClick={() => handleEditDocente(docente)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#ffffff',
                        border: `1px solid ${theme.colors.primaryLight}50`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = `${theme.colors.primary}30`;
                        e.target.style.borderColor = theme.colors.primaryLight;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.1)';
                        e.target.style.borderColor = `${theme.colors.primaryLight}50`;
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteDocente(docente.ci_doc)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'rgba(231, 76, 60, 0.15)',
                        color: '#ff6b6b',
                        border: '1px solid rgba(231, 76, 60, 0.3)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(231, 76, 60, 0.25)';
                        e.target.style.borderColor = '#e74c3c';
                        e.target.style.color = '#ff5252';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(231, 76, 60, 0.15)';
                        e.target.style.borderColor = 'rgba(231, 76, 60, 0.3)';
                        e.target.style.color = '#ff6b6b';
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel de Estudiantes */}
      {activeSubTab === 'estudiantes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2>Gestión de Estudiantes</h2>
            <button
              onClick={() => setShowEstudianteModal(true)}
              style={{
                padding: '12px 28px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.opacity = '1';
              }}
            >
              <span>✨</span> Nuevo Estudiante
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
              <p>Cargando estudiantes...</p>
            </div>
          ) : estudiantes.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: theme.colors.cardBackground,
              borderRadius: '12px',
              border: `2px dashed ${theme.colors.primaryLight}40`
            }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎓</div>
              <h3 style={{ margin: '0 0 10px 0' }}>No hay estudiantes</h3>
              <p style={{ opacity: 0.7 }}>Comienza registrando el primer estudiante</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {estudiantes.map(estudiante => (
                <div
                  key={estudiante.ci_est}
                  style={{
                    padding: '24px',
                    background: '#2c2c3e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                  }}
                >
                  <h3 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>{estudiante.id_user?.nombre} {estudiante.id_user?.apellido}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.colors.primaryLight }}>📋</span>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>CI:</strong> {estudiante.ci_est}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.colors.primaryLight }}>✉️</span>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Email:</strong> {estudiante.id_user?.correo}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.colors.primaryLight }}>📚</span>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Carrera:</strong> {estudiante.carrera}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: theme.colors.primaryLight }}>📖</span>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>Semestre:</strong> {estudiante.semestre}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      onClick={() => handleEditEstudiante(estudiante)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#ffffff',
                        border: `1px solid ${theme.colors.primaryLight}50`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = `${theme.colors.primary}30`;
                        e.target.style.borderColor = theme.colors.primaryLight;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.1)';
                        e.target.style.borderColor = `${theme.colors.primaryLight}50`;
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteEstudiante(estudiante.ci_est)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'rgba(231, 76, 60, 0.15)',
                        color: '#ff6b6b',
                        border: '1px solid rgba(231, 76, 60, 0.3)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(231, 76, 60, 0.25)';
                        e.target.style.borderColor = '#e74c3c';
                        e.target.style.color = '#ff5252';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(231, 76, 60, 0.15)';
                        e.target.style.borderColor = 'rgba(231, 76, 60, 0.3)';
                        e.target.style.color = '#ff6b6b';
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Nuevo Usuario */}
      {showUserModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#2c2c3e',
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ marginTop: 0, color: '#ffffff', marginBottom: '25px', fontSize: '24px' }}>
              {editingUser ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}
            </h2>
            <form onSubmit={handleCreateUser}>
              {editingUser && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                    CI
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userCiDisplay}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#ffffff',
                      cursor: 'not-allowed',
                      fontSize: '14px'
                    }}
                  />
                  <small style={{ display: 'block', marginTop: '5px', opacity: 0.7, color: '#a0a0a0', fontSize: '12px' }}>
                    El CI se gestiona desde la sección de {userForm.rol === 'estudiante' ? 'Estudiantes' : 'Docentes'}
                  </small>
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={userForm.nombre}
                  onChange={(e) => setUserForm({...userForm, nombre: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={userForm.apellido}
                  onChange={(e) => setUserForm({...userForm, apellido: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Correo *
                </label>
                <input
                  type="email"
                  required
                  value={userForm.correo}
                  onChange={(e) => setUserForm({...userForm, correo: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={userForm.contrasena}
                  onChange={(e) => setUserForm({...userForm, contrasena: e.target.value})}
                  placeholder={editingUser ? 'Dejar vacío para mantener la actual' : ''}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Rol *
                </label>
                <select
                  required
                  disabled={editingUser}
                  value={userForm.rol}
                  onChange={(e) => {
                    const newRol = e.target.value;
                    setUserForm({...userForm, rol: newRol});
                    
                    // Si no está editando y selecciona estudiante o docente, redirigir al modal correspondiente
                    if (!editingUser) {
                      if (newRol === 'estudiante') {
                        setShowUserModal(false);
                        setEstudianteForm({
                          ci_est: '',
                          nombre: userForm.nombre,
                          apellido: userForm.apellido,
                          correo: userForm.correo,
                          contrasena: userForm.contrasena,
                          carrera: '',
                          semestre: 1
                        });
                        setShowEstudianteModal(true);
                      } else if (newRol === 'docente') {
                        setShowUserModal(false);
                        setDocenteForm({
                          ci_doc: '',
                          nombre: userForm.nombre,
                          apellido: userForm.apellido,
                          correo: userForm.correo,
                          contrasena: userForm.contrasena,
                          especialidad_doc: ''
                        });
                        setShowDocenteModal(true);
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: editingUser ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    cursor: editingUser ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <option value="administrador" style={{ background: '#1a1a2e', color: '#ffffff' }}>Administrador</option>
                  <option value="estudiante" style={{ background: '#1a1a2e', color: '#ffffff' }}>Estudiante</option>
                  <option value="docente" style={{ background: '#1a1a2e', color: '#ffffff' }}>Docente</option>
                </select>
              </div>

              {!editingUser && (
                <div style={{ background: `${theme.colors.primaryLight}20`, padding: '12px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${theme.colors.primaryLight}50` }}>
                  <p style={{ fontSize: '13px', color: theme.colors.primaryLight, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>💡</span>
                    Si seleccionas Estudiante o Docente, se abrirá el formulario completo con todos los campos necesarios.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '25px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                    setUserCiDisplay('');
                    setUserForm({ nombre: '', apellido: '', correo: '', contrasena: '', rol: 'administrador' });
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || (!editingUser && userForm.rol !== 'administrador')}
                  style={{
                    padding: '12px 24px',
                    background: (loading || (!editingUser && userForm.rol !== 'administrador')) ? `${theme.colors.primary}60` : theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (loading || (!editingUser && userForm.rol !== 'administrador')) ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!loading && (editingUser || userForm.rol === 'administrador')) {
                      e.target.style.background = `${theme.colors.primaryDark}`;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading && (editingUser || userForm.rol === 'administrador')) {
                      e.target.style.background = theme.colors.primary;
                    }
                  }}
                >
                  {loading ? (editingUser ? 'Actualizando...' : 'Creando...') : (editingUser ? 'Actualizar Usuario' : 'Crear Administrador')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Docente */}
      {showDocenteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#2c2c3e',
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ marginTop: 0, color: '#ffffff', marginBottom: '25px', fontSize: '24px' }}>
              {editingDocente ? '✏️ Editar Docente' : '👨‍🏫 Nuevo Docente'}
            </h2>
            <form onSubmit={handleCreateDocente}>
              {!editingDocente && (
                <>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                      CI *
                    </label>
                    <input
                      type="text"
                      required
                      value={docenteForm.ci_doc}
                      onChange={(e) => setDocenteForm({...docenteForm, ci_doc: e.target.value})}
                      placeholder="Ej: 1234567 LP"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.primaryLight}50`,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={docenteForm.nombre}
                      onChange={(e) => setDocenteForm({...docenteForm, nombre: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.primaryLight}50`,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                      Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={docenteForm.apellido}
                      onChange={(e) => setDocenteForm({...docenteForm, apellido: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.primaryLight}50`,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                      Correo *
                    </label>
                    <input
                      type="email"
                      required
                      value={docenteForm.correo}
                      onChange={(e) => setDocenteForm({...docenteForm, correo: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.primaryLight}50`,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      value={docenteForm.contrasena}
                      onChange={(e) => setDocenteForm({...docenteForm, contrasena: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.primaryLight}50`,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </>
              )}

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Especialidad *
                </label>
                <input
                  type="text"
                  required
                  value={docenteForm.especialidad_doc}
                  onChange={(e) => setDocenteForm({...docenteForm, especialidad_doc: e.target.value})}
                  placeholder="Ej: Matemáticas, Física, etc."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}50`,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ background: `${theme.colors.primaryLight}20`, padding: '12px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${theme.colors.primaryLight}50` }}>
                <p style={{ fontSize: '13px', color: theme.colors.primaryLight, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>💡</span>
                  El docente se registrará automáticamente con estos datos en el sistema.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '25px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDocenteModal(false);
                    setEditingDocente(null);
                    setDocenteForm({ ci_doc: '', nombre: '', apellido: '', correo: '', contrasena: '', especialidad_doc: '' });
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading ? `${theme.colors.primary}60` : theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxShadow: `0 4px 12px ${theme.colors.primary}40`
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.background = theme.colors.primaryDark || theme.colors.primary;
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.target.style.background = theme.colors.primary;
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loading ? (editingDocente ? 'Actualizando...' : 'Creando...') : (editingDocente ? 'Actualizar Docente' : 'Crear Docente')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Estudiante */}
      {showEstudianteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#2c2c3e',
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ marginTop: 0, color: '#ffffff', marginBottom: '25px', fontSize: '24px' }}>
              {editingEstudiante ? '✏️ Editar Estudiante' : '🎓 Nuevo Estudiante'}
            </h2>
            <form onSubmit={handleCreateEstudiante}>
              {!editingEstudiante && (
                <>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                      CI *
                    </label>
                    <input
                      type="text"
                      required
                      value={estudianteForm.ci_est}
                      onChange={(e) => setEstudianteForm({...estudianteForm, ci_est: e.target.value})}
                      placeholder="Ej: 9876543 CH"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.primaryLight}50`,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={estudianteForm.nombre}
                      onChange={(e) => setEstudianteForm({...estudianteForm, nombre: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: "1px solid ${theme.colors.primaryLight}50",
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                      Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={estudianteForm.apellido}
                      onChange={(e) => setEstudianteForm({...estudianteForm, apellido: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: "1px solid ${theme.colors.primaryLight}50",
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                      Correo *
                    </label>
                    <input
                      type="email"
                      required
                      value={estudianteForm.correo}
                      onChange={(e) => setEstudianteForm({...estudianteForm, correo: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: "1px solid ${theme.colors.primaryLight}50",
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      value={estudianteForm.contrasena}
                      onChange={(e) => setEstudianteForm({...estudianteForm, contrasena: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: "1px solid ${theme.colors.primaryLight}50",
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </>
              )}

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Carrera *
                </label>
                <input
                  type="text"
                  required
                  value={estudianteForm.carrera}
                  onChange={(e) => setEstudianteForm({...estudianteForm, carrera: e.target.value})}
                  placeholder="Ej: Ingeniería de Sistemas"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: "1px solid ${theme.colors.primaryLight}50",
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff', fontSize: '14px' }}>
                  Semestre *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="12"
                  value={estudianteForm.semestre || ''}
                  onChange={(e) => setEstudianteForm({...estudianteForm, semestre: e.target.value ? parseInt(e.target.value) : ''})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: "1px solid ${theme.colors.primaryLight}50",
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ background: `${theme.colors.primaryLight}20`, padding: '12px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${theme.colors.primaryLight}50` }}>
                <p style={{ fontSize: '13px', color: theme.colors.primaryLight, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>💡</span>
                  El estudiante se registrará automáticamente con estos datos en el sistema.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '25px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEstudianteModal(false);
                    setEditingEstudiante(null);
                    setEstudianteForm({ ci_est: '', nombre: '', apellido: '', correo: '', contrasena: '', carrera: '', semestre: 1 });
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading ? `${theme.colors.primary}60` : theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxShadow: `0 4px 12px ${theme.colors.primary}40`
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.background = theme.colors.primaryDark || theme.colors.primary;
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.target.style.background = theme.colors.primary;
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loading ? (editingEstudiante ? 'Actualizando...' : 'Creando...') : (editingEstudiante ? 'Actualizar Estudiante' : 'Crear Estudiante')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPanel;


