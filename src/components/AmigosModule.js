import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import amigosService from '../services/amigosService';
import api from '../services/api';
import { uploadFiles } from '../services/uploadService';
import '../styles/AmigosModule.css';

const AmigosModule = () => {
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('amigos'); // amigos, solicitudes, buscar
  const [amigos, setAmigos] = useState([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([]);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Función para mostrar toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (activeTab === 'amigos') {
        const data = await amigosService.obtenerAmigos();
        setAmigos(data);
      } else if (activeTab === 'solicitudes') {
        const recibidas = await amigosService.obtenerSolicitudesRecibidas();
        const enviadas = await amigosService.obtenerSolicitudesEnviadas();
        setSolicitudesRecibidas(recibidas);
        setSolicitudesEnviadas(enviadas);
      }
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAceptarSolicitud = async (idRelacion) => {
    try {
      await amigosService.responderSolicitud(idRelacion, 'aceptar');
      showToast('✅ Solicitud aceptada', 'success');
      cargarDatos();
    } catch (err) {
      console.error('Error al aceptar solicitud:', err);
      showToast('❌ Error al aceptar la solicitud', 'error');
    }
  };

  const handleRechazarSolicitud = async (idRelacion) => {
    try {
      await amigosService.responderSolicitud(idRelacion, 'rechazar');
      showToast('Solicitud rechazada', 'info');
      cargarDatos();
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      showToast('❌ Error al rechazar la solicitud', 'error');
    }
  };

  const handleEliminarAmigo = async (idRelacion) => {
    try {
      await amigosService.eliminarAmigo(idRelacion);
      showToast('Amigo eliminado', 'info');
      cargarDatos();
    } catch (err) {
      console.error('Error al eliminar amigo:', err);
      showToast('❌ Error al eliminar el amigo', 'error');
    }
  };

  const buscarUsuarios = async (query) => {
    if (!query || query.length < 2) {
      setUsuarios([]);
      return;
    }

    setSearchLoading(true);
    try {
      const data = await amigosService.buscarUsuarios(query);
      setUsuarios(data);
    } catch (err) {
      console.error('Error al buscar usuarios:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Función para confirmar cambio de foto
  const handleConfirmPhotoChange = async () => {
    if (!selectedFile) return;
    
    try {
      setShowPhotoModal(false);
      
      // Mostrar loading
      showToast('📷 Subiendo foto...', 'info');
      
      // Subir archivo
      const { data: urls, error } = await uploadFiles([selectedFile]);
      
      if (error) {
        showToast('❌ Error al subir la foto: ' + error, 'error');
        return;
      }
      
      // Actualizar usuario en el backend
      await api.put(`/usuarios/${user.id_user}`, {
        foto_perfil: urls[0]
      });
      
      // Actualizar contexto y localStorage
      const updatedUser = { ...user, foto_perfil: urls[0] };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('user-data', JSON.stringify(updatedUser));
      
      // Actualizar en el contexto si existe la función
      if (updateUser) {
        updateUser({ foto_perfil: urls[0] });
      }
      
      showToast('✅ Foto de perfil actualizada correctamente', 'success');
      
      // Recargar después de 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      console.error('Error:', err);
      showToast('❌ Error al cambiar la foto de perfil', 'error');
    } finally {
      setSelectedFile(null);
      setPreviewPhoto(null);
    }
  };

  const handleEnviarSolicitud = async (idUsuario) => {
    try {
      await amigosService.enviarSolicitud(idUsuario);
      showToast('✅ Solicitud enviada exitosamente', 'success');
      setSearchQuery('');
      setUsuarios([]);
      cargarDatos();
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      showToast('❌ Error al enviar la solicitud', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'buscar' && searchQuery && searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        buscarUsuarios(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (activeTab === 'buscar' && searchQuery.length < 2) {
      setUsuarios([]);
    }
  }, [searchQuery, activeTab]);

  const getUserInitials = (nombre, apellido) => {
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    return (n + a).toUpperCase() || '?';
  };

  const filteredAmigos = amigos.filter(amigo => 
    `${amigo.nombre} ${amigo.apellido}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="amigos-container">
      {/* Header horizontal compacto */}
      <div className="amigos-header">
        <div className="user-profile-section">
          <div className="user-avatar-large">
            {getUserInitials(user?.nombre, user?.apellido)}
          </div>
          <div className="user-info-compact">
            <h2 className="user-name">
              {user?.nombre} {user?.apellido}
            </h2>
            <p className="user-email">{user?.correo}</p>
            <p className="user-info">
              {user?.rol === 'estudiante' ? 'administrador' : user?.rol} • {user?.carrera}
            </p>
          </div>
        </div>
        
        <div className="search-bar">
          <div className="search-icon">🔍</div>
          <input 
            type="text" 
            placeholder="Buscar usuarios..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && activeTab === 'buscar' && searchQuery.length >= 2) {
                buscarUsuarios(searchQuery);
              }
            }}
          />
        </div>
        
        <input 
          type="file" 
          id="profile-photo-input" 
          accept="image/*" 
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validar que sea imagen
            if (!file.type.startsWith('image/')) {
              alert('⚠️ Solo se permiten imágenes');
              return;
            }
            
            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
              alert('⚠️ La imagen no debe superar 5MB');
              return;
            }
            
            // Mostrar preview
            const reader = new FileReader();
            reader.onloadend = () => {
              setPreviewPhoto(reader.result);
              setSelectedFile(file);
              setShowPhotoModal(true);
            };
            reader.readAsDataURL(file);
            
            // Limpiar el input
            e.target.value = '';
          }}
        />
        <div 
          className="camera-icon" 
          onClick={() => document.getElementById('profile-photo-input').click()}
          style={{ cursor: 'pointer' }}
        >
          📷
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'amigos' ? 'active' : ''}`}
          onClick={() => setActiveTab('amigos')}
        >
          👥 Mis Amigos
        </button>
        <button 
          className={`tab-button ${activeTab === 'solicitudes' ? 'active' : ''}`}
          onClick={() => setActiveTab('solicitudes')}
        >
          📬 Solicitudes {(solicitudesRecibidas.length > 0) && `(${solicitudesRecibidas.length})`}
        </button>
        <button 
          className={`tab-button ${activeTab === 'buscar' ? 'active' : ''}`}
          onClick={() => setActiveTab('buscar')}
        >
          🔍 Buscar Usuarios
        </button>
      </div>

      {/* Contenido */}
      <div className="content-area">
        {loading ? (
          <div className="loading-state">Cargando...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : activeTab === 'amigos' ? (
          <>
            {filteredAmigos.length === 0 ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
                marginTop: '40px'
              }}>
                <div style={{
                  background: '#2c2c3e',
                  borderRadius: '16px',
                  padding: '32px 48px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  maxWidth: '450px'
                }}>
                  <div style={{ fontSize: '56px', marginBottom: '20px', opacity: 0.6 }}>
                    👥
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '10px', color: 'white' }}>
                    No tienes amigos aún
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
                    Usa la búsqueda para encontrar personas y agregar amigos
                  </p>
                  <button
                    onClick={() => setActiveTab('buscar')}
                    style={{
                      padding: '10px 28px',
                      background: theme.colors.primary,
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    🔍 Buscar Usuarios
                  </button>
                </div>
              </div>
            ) : (
              <div className="amigos-list">
                {filteredAmigos.map((amigo) => (
                  <div key={amigo.id_user} className="usuario-card">
                    <div className="usuario-card-header">
                      <div className="avatar-large">
                        {getUserInitials(amigo.nombre, amigo.apellido)}
                      </div>
                      <div className="usuario-info">
                        <h3 className="usuario-name">
                          {amigo.nombre} {amigo.apellido}
                        </h3>
                        <p className="usuario-email">{amigo.correo}</p>
                        <span className="usuario-badge">{amigo.rol}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        className="message-button-new"
                        onClick={() => alert('Funcionalidad de mensajes próximamente')}
                      >
                        💬 Mensaje
                      </button>
                      <button 
                        className="delete-button-new"
                        onClick={() => handleEliminarAmigo(amigo.id_relacion)}
                      >
                        ❌ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'solicitudes' ? (
          <>
            <h3 style={{ color: 'white', marginBottom: '16px' }}>Solicitudes Recibidas</h3>
            {solicitudesRecibidas.length === 0 ? (
              <div style={{
                background: 'rgba(40, 44, 52, 0.6)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '32px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
                  📬
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.95rem', margin: 0 }}>
                  No tienes solicitudes pendientes
                </p>
              </div>
            ) : (
              <div className="solicitudes-list">
                {solicitudesRecibidas.map((solicitud) => {
                  const usuario = solicitud.usuario1;
                  return (
                    <div key={solicitud.id_relacion_usuario} className="usuario-card">
                      <div className="usuario-card-header">
                        <div className="avatar-large">
                          {getUserInitials(usuario?.nombre, usuario?.apellido)}
                        </div>
                        <div className="usuario-info">
                          <h3 className="usuario-name">
                            {usuario?.nombre} {usuario?.apellido}
                          </h3>
                          <p className="usuario-email">{usuario?.correo}</p>
                          <span className="usuario-badge">{usuario?.rol}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          className="accept-button-new"
                          onClick={() => handleAceptarSolicitud(solicitud.id_relacion_usuario)}
                        >
                          ✅ Aceptar
                        </button>
                        <button 
                          className="reject-button-new"
                          onClick={() => handleRechazarSolicitud(solicitud.id_relacion_usuario)}
                        >
                          ❌ Rechazar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <h3 style={{ color: 'white', marginBottom: '16px', marginTop: '32px' }}>Solicitudes Enviadas</h3>
            {solicitudesEnviadas.length === 0 ? (
              <div style={{
                background: 'rgba(40, 44, 52, 0.6)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
                  🔍
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.95rem', margin: 0 }}>
                  No has enviado solicitudes
                </p>
              </div>
            ) : (
              <div className="solicitudes-list">
                {solicitudesEnviadas.map((solicitud) => {
                  const usuario = solicitud.usuario2;
                  return (
                    <div key={solicitud.id_relacion_usuario} className="usuario-card">
                      <div className="usuario-card-header">
                        <div className="avatar-large">
                          {getUserInitials(usuario?.nombre, usuario?.apellido)}
                        </div>
                        <div className="usuario-info">
                          <h3 className="usuario-name">
                            {usuario?.nombre} {usuario?.apellido}
                          </h3>
                          <p className="usuario-email">{usuario?.correo}</p>
                          <span className="usuario-badge">{usuario?.rol}</span>
                        </div>
                      </div>
                      <button 
                        className="cancel-button-new"
                        onClick={() => handleRechazarSolicitud(solicitud.id_relacion_usuario)}
                      >
                        ❌ Cancelar solicitud
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : activeTab === 'buscar' ? (
          <>
            {searchLoading ? (
              <div className="loading-state">Buscando...</div>
            ) : usuarios.length === 0 ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px'
              }}>
                <div style={{
                  background: 'rgba(40, 44, 52, 0.6)',
                  borderRadius: '16px',
                  padding: '32px 40px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  maxWidth: '380px'
                }}>
                  <div style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.4 }}>
                    🔍
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', color: 'white' }}>
                    Busca usuarios
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                    Escribe un nombre, apellido o correo en el buscador para encontrar personas
                  </p>
                </div>
              </div>
            ) : (
              <div className="buscar-list">
                {usuarios.map((usuario) => (
                  <div key={usuario.id_user} className="usuario-card">
                    <div className="usuario-card-header">
                      <div className="avatar-large">
                        {getUserInitials(usuario.nombre, usuario.apellido)}
                      </div>
                      <div className="usuario-info">
                        <h3 className="usuario-name">
                          {usuario.nombre} {usuario.apellido}
                        </h3>
                        <p className="usuario-email">{usuario.correo}</p>
                        <span className="usuario-badge">{usuario.rol}</span>
                      </div>
                    </div>
                    <button 
                      className={`add-friend-button ${usuario.estadoRelacion ? 'disabled' : ''}`}
                      onClick={() => handleEnviarSolicitud(usuario.id_user)}
                      disabled={usuario.estadoRelacion === 'pendiente' || usuario.estadoRelacion === 'aceptado'}
                    >
                      {usuario.estadoRelacion === 'aceptado' ? '✅ Ya son amigos' : 
                       usuario.estadoRelacion === 'pendiente' ? '⏳ Solicitud enviada' : '➕ Enviar solicitud'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No hay contenido para mostrar</p>
          </div>
        )}
      </div>

      {/* Toast de notificaciones */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Modal de confirmación de foto */}
      {showPhotoModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#2a2d35',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ 
              color: 'white', 
              marginBottom: '16px',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              Cambiar foto de perfil
            </h3>
            
            <div style={{
              width: '200px',
              height: '200px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid #8B1E41'
            }}>
              <img 
                src={previewPhoto} 
                alt="Preview" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              ¿Deseas establecer esta imagen como tu foto de perfil?
            </p>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  setPreviewPhoto(null);
                  setSelectedFile(null);
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPhotoChange}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #8B1E41, #AD3F62)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmigosModule;
