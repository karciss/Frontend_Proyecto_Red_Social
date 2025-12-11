import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import amigosService from '../services/amigosService';
import ProfileSettingsModuleNew from './ProfileSettingsModuleNew';
import '../styles/UserProfileModuleNew.css';

const UserProfileModuleNew = ({ onClose }) => {
  const { theme, isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const profileRef = useRef(null);
  const menuRef = useRef(null);
  
  // Estado para los datos del usuario
  const [userData, setUserData] = useState({
    nombre: user?.nombre || 'Usuario de Prueba',
    apellido: user?.apellido || '',
    correo: user?.correo || 'usuario@ejemplo.com',
    rol: user?.rol || 'estudiante',
    carrera: user?.carrera || 'Informática',
    semestre: user?.semestre || '5',
    foto_perfil: user?.foto_perfil || null
  });

  // Estado para las secciones del perfil y menú desplegable
  const [activeTab, setActiveTab] = useState('publicaciones');
  const [menuVisible, setMenuVisible] = useState(false);
  const [amigos, setAmigos] = useState([]);
  const [loadingAmigos, setLoadingAmigos] = useState(false);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loadingPublicaciones, setLoadingPublicaciones] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const fileInputRef = useRef(null);

  // Cargar amigos y publicaciones cuando se monta el componente
  useEffect(() => {
    cargarAmigos();
    cargarPublicaciones();
  }, []);

  // Sincronizar userData con el contexto user cuando cambie
  useEffect(() => {
    if (user) {
      setUserData({
        nombre: user.nombre || 'Usuario de Prueba',
        apellido: user.apellido || '',
        correo: user.correo || 'usuario@ejemplo.com',
        rol: user.rol || 'estudiante',
        carrera: user.carrera || 'Informática',
        semestre: user.semestre || '5',
        foto_perfil: user.foto_perfil || null
      });
    }
  }, [user, user?.foto_perfil]);

  const cargarAmigos = async () => {
    try {
      setLoadingAmigos(true);
      const response = await amigosService.obtenerAmigos();
      console.log('===== RESPUESTA COMPLETA DE AMIGOS =====');
      console.log('Response:', response);
      console.log('Response.data:', response?.data);
      console.log('Type of response:', typeof response);
      console.log('Is Array:', Array.isArray(response));
      
      // Intentar diferentes formas de obtener los datos
      let amigosData = [];
      if (Array.isArray(response)) {
        amigosData = response;
      } else if (response && Array.isArray(response.data)) {
        amigosData = response.data;
      } else if (response && response.amigos && Array.isArray(response.amigos)) {
        amigosData = response.amigos;
      }
      
      console.log('Amigos procesados:', amigosData);
      console.log('Cantidad de amigos:', amigosData.length);
      setAmigos(amigosData);
    } catch (error) {
      console.error('===== ERROR AL CARGAR AMIGOS =====');
      console.error('Error completo:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      setAmigos([]);
    } finally {
      setLoadingAmigos(false);
    }
  };

  const cargarPublicaciones = async () => {
    try {
      setLoadingPublicaciones(true);
      const token = localStorage.getItem('user-token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backend-social-f3ob.onrender.com/api/v1'}/publicaciones?skip=0&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo las publicaciones del usuario actual
        const misPublicaciones = data.filter(pub => pub.id_user === user?.id_user);
        console.log('📰 Mis publicaciones:', misPublicaciones);
        setPublicaciones(misPublicaciones);
      }
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
      setPublicaciones([]);
    } finally {
      setLoadingPublicaciones(false);
    }
  };

  // Función para manejar cambio de foto
  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({
          ...prev,
          foto_perfil: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para abrir selector de archivo
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };
  
  // Efecto para cerrar el modal con la tecla ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) { // Código de tecla ESC
        onClose();
      }
    };
    
    // Maneja clics fuera del menú para cerrarlo
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Aplicar estilos CSS variables basados en el tema
    document.documentElement.style.setProperty('--header-bg', 
      'linear-gradient(135deg, #8B1E41, #AD3F62)'); // Mantenemos el color institucional en ambos temas
    
    // No es necesario redefinir estas propiedades, usaremos las variables globales definidas en ThemeController
    /*document.documentElement.style.setProperty('--profile-bg-color', 
      isDarkMode ? theme.colors.card : '#FFFFFF');
    document.documentElement.style.setProperty('--content-bg', 
      isDarkMode ? theme.colors.background : '#f5f5f7');
    document.documentElement.style.setProperty('--profile-text-color', 
      isDarkMode ? '#FFFFFF' : theme.colors.text);*/
      
    // Solo mantenemos estilos específicos del perfil
    document.documentElement.style.setProperty('--profile-border-color', 
      isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
    document.documentElement.style.setProperty('--profile-bg-card', 
      isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF');
    document.documentElement.style.setProperty('--post-bg', 
      isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff');
    document.documentElement.style.setProperty('--pill-bg', 
      isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0');
    document.documentElement.style.setProperty('--pill-text', 
      isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#666');
    document.documentElement.style.setProperty('--empty-state-color', 
      isDarkMode ? '#999' : '#888');
      
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, theme, isDarkMode]);
  
  // Iniciales del usuario
  const getUserInitials = () => {
    return (userData.nombre?.charAt(0) + (userData.apellido?.charAt(0) || '')).toUpperCase() || 'US';
  };

  // Si se debe mostrar configuración, renderizar el componente de settings
  if (showSettings) {
    return (
      <div style={{ position: 'relative' }}>
        <ProfileSettingsModuleNew />
        <button 
          onClick={() => setShowSettings(false)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 10001,
            padding: '10px 20px',
            backgroundColor: '#8B1E41',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(139, 30, 65, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#6B1632'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#8B1E41'}
        >
          ← Volver al perfil
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile-container-new">
      {/* Sección superior con gradiente de color institucional */}
      <div className="profile-header-new">
        <div className="search-bar-new">
          <div className="search-dot"></div>
          <input type="text" placeholder="Buscar..." />
        </div>
        
        <div className="user-avatar-new" style={{
          backgroundImage: userData.foto_perfil ? `url(${userData.foto_perfil})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {!userData.foto_perfil && getUserInitials()}
        </div>
      </div>
      
      {/* Sección inferior */}
      <div className="profile-content-new">
        <div className="user-info-section">
          <h2 className="user-name">{`${userData.nombre} ${userData.apellido}`}</h2>
          <p className="user-email">{userData.correo}</p>
          <p className="user-role">{userData.rol} • {userData.carrera} • {userData.semestre}° semestre</p>
        </div>
        
      {/* Categorías */}
      <div className="profile-categories-new">
        <div 
          className={`category-pill ${activeTab === 'publicaciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('publicaciones')}
        >
          Publicaciones
        </div>
        <div 
          className={`category-pill ${activeTab === 'amigos' ? 'active' : ''}`}
          onClick={() => setActiveTab('amigos')}
        >
          Amigos
        </div>
      </div>        {/* Contenido según la pestaña seleccionada */}
        <div className="tab-content">
          {activeTab === 'publicaciones' && (
            <div className="publicaciones-content">
              {loadingPublicaciones ? (
                <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.textSecondary }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
                  <div>Cargando publicaciones...</div>
                </div>
              ) : publicaciones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.textSecondary }}>
                  <div style={{ fontSize: '60px', marginBottom: '16px' }}>📝</div>
                  <div>No has creado publicaciones aún</div>
                  <div style={{ fontSize: '14px', marginTop: '8px' }}>Comparte algo con tus compañeros</div>
                </div>
              ) : (
                publicaciones.map((publicacion) => {
                  const fecha = new Date(publicacion.fecha_publicacion);
                  const ahora = new Date();
                  const diffMs = ahora - fecha;
                  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffDias = Math.floor(diffHoras / 24);
                  
                  let tiempoTexto = '';
                  if (diffDias > 0) {
                    tiempoTexto = `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
                  } else if (diffHoras > 0) {
                    tiempoTexto = `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
                  } else {
                    const diffMinutos = Math.floor(diffMs / (1000 * 60));
                    tiempoTexto = `Hace ${diffMinutos || 1} minuto${diffMinutos > 1 ? 's' : ''}`;
                  }
                  
                  return (
                    <div key={publicacion.id_publicacion} className="post-item">
                      <div className="post-header">
                        <div className="post-avatar">{getUserInitials()}</div>
                        <div className="post-info">
                          <div className="post-author">{`${userData.nombre} ${userData.apellido}`}</div>
                          <div className="post-time">{tiempoTexto}</div>
                        </div>
                      </div>
                      <div className="post-content">
                        {(publicacion.contenido || '').replace('[EVENTO]', '')}
                      </div>
                      {publicacion.media_urls && publicacion.media_urls.length > 0 && (
                        <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden' }}>
                          <img 
                            src={publicacion.media_urls[0]} 
                            alt="Imagen de publicación" 
                            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div className="post-actions">
                        <button className="post-action-btn">👍 {publicacion.total_reacciones || 0}</button>
                        <button className="post-action-btn">💬 {publicacion.total_comentarios || 0}</button>
                        <button className="post-action-btn">↗️ Compartir</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
          
          {activeTab === 'amigos' && (
            <div className="amigos-content">
              {loadingAmigos ? (
                <p className="empty-state">Cargando amigos...</p>
              ) : amigos.length > 0 ? (
                <>
                  <p style={{color: 'var(--text-primary)', padding: '10px', fontSize: '12px'}}>
                    Total de amigos: {amigos.length}
                  </p>
                  <div className="content-grid-new">
                    {amigos.map((amigo, index) => {
                      console.log(`Procesando amigo ${index}:`, amigo);
                      
                      // Determinar qué usuario mostrar
                      let amigoData = null;
                      if (amigo.usuario_origen && amigo.usuario_destino) {
                        amigoData = amigo.usuario_origen?.id_user === user?.id_user 
                          ? amigo.usuario_destino 
                          : amigo.usuario_origen;
                      } else if (amigo.usuario_origen) {
                        amigoData = amigo.usuario_origen;
                      } else if (amigo.usuario_destino) {
                        amigoData = amigo.usuario_destino;
                      } else {
                        // Quizás el amigo viene directamente sin estructura de relación
                        amigoData = amigo;
                      }
                      
                      // Validar que amigoData existe
                      if (!amigoData || (!amigoData.nombre && !amigoData.correo)) {
                        console.warn('Datos de amigo no disponibles o incompletos:', amigo);
                        return null;
                      }
                      
                      const initials = `${amigoData.nombre?.charAt(0) || 'U'}${amigoData.apellido?.charAt(0) || 'S'}`.toUpperCase();
                      const nombreCompleto = `${amigoData.nombre || ''} ${amigoData.apellido || ''}`.trim() || amigoData.correo || 'Usuario';
                      
                      return (
                        <div key={amigo.id_relacion || amigo.id_user || index} className="grid-item-new amigo-item">
                          <div className="amigo-avatar" style={{
                            background: 'linear-gradient(135deg, #6B1632, #8B1E41)',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: '600',
                            margin: '0 auto 10px',
                            overflow: 'hidden'
                          }}>
                            {amigoData.foto_perfil ? (
                              <img 
                                src={amigoData.foto_perfil} 
                                alt={nombreCompleto}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '50%'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.textContent = initials;
                                }}
                              />
                            ) : initials}
                          </div>
                          <div className="amigo-name" style={{
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            wordBreak: 'break-word'
                          }}>
                            {nombreCompleto}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="empty-state">No hay amigos para mostrar</p>
              )}
            </div>
          )}
        </div>
        
        {/* Barra de navegación inferior */}
        <div className="bottom-nav-new">
          <div className="menu-container" ref={menuRef}>
            <div className="menu-icon" onClick={() => setMenuVisible(!menuVisible)}>≡</div>
            
            {/* Menú desplegable */}
            {menuVisible && (
              <div className="dropdown-menu">
                <div className="menu-item" onClick={() => {
                  setMenuVisible(false);
                  setShowSettings(true);
                }}>
                  <div className="menu-item-icon">⚙️</div>
                  <div className="menu-item-text">Configuración</div>
                </div>
                <div className="menu-item" onClick={() => {
                  setMenuVisible(false);
                  setShowSettings(true);
                }}>
                  <div className="menu-item-icon">👤</div>
                  <div className="menu-item-text">Editar perfil</div>
                </div>
                <div className="menu-item" onClick={() => {
                  setMenuVisible(false);
                  setShowLogoutModal(true);
                }}>
                  <div className="menu-item-icon">🚪</div>
                  <div className="menu-item-text">Cerrar sesión</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Botón OK */}
          <div className="ok-button" onClick={onClose}>
            Ok
          </div>
        </div>
      </div>

      {/* Modal de confirmación de cerrar sesión */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '24px',
              color: isDarkMode ? '#ffffff' : '#1a1a1a',
              fontWeight: '600'
            }}>
              ¿Estás seguro de que deseas cerrar sesión?
            </h3>
            <p style={{
              margin: '0 0 25px 0',
              fontSize: '16px',
              color: isDarkMode ? '#b0b0b0' : '#666666',
              lineHeight: '1.5'
            }}>
              Tendrás que volver a iniciar sesión para acceder a tu cuenta.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
                  color: isDarkMode ? '#ffffff' : '#333333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = isDarkMode ? '#4a4a4a' : '#e0e0e0'}
                onMouseOut={(e) => e.target.style.backgroundColor = isDarkMode ? '#3a3a3a' : '#f0f0f0'}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#8B1E41',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#6B1632'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#8B1E41'}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileModuleNew;