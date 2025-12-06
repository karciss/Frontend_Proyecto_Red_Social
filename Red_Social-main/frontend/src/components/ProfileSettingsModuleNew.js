import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfileSettings.css';
import '../styles/switchStyles.css';

const ProfileSettingsModuleNew = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  
  // Estado para la sección activa
  const [activeSection, setActiveSection] = useState('perfil');
  
  // Estado para los datos del usuario
  const [userData, setUserData] = useState({
    nombre: user?.nombre || 'Usuario de Prueba',
    apellido: user?.apellido || '',
    correo: user?.correo || 'usuario@ejemplo.com',
    rol: user?.rol || 'estudiante',
    carrera: user?.carrera || 'Informática',
    semestre: user?.semestre || '5',
  });

  // Manejador de cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  // Manejador para guardar cambios
  const handleSaveChanges = () => {
    // Aquí iría la lógica para guardar los cambios en el servidor
    alert('Cambios guardados correctamente');
  };

  // Renderizar la sección activa
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'perfil':
        return (
          <>
            <h2 className="profile-section-title" style={{ marginTop: '0', paddingTop: '0' }}>Perfil de Usuario</h2>
            
            <div style={{
              padding: '15px 20px',
              marginTop: '-20px'
            }}>
              <div className="profile-content-layout" style={{ 
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vh - 180px)',
                overflow: 'auto',
                scrollbarWidth: 'thin',
                backgroundColor: '#2B2B33',
                borderRadius: '20px',
                padding: '25px',
                position: 'relative'
              }}>
                {/* Imagen de perfil */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '30px'
                }}>
                  {/* Barra superior con camera */}
                  <div style={{
                    position: 'absolute',
                    top: '-25px',
                    right: '-25px',
                    left: '-25px',
                    height: '40px',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    backgroundColor: '#1E1E24',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    padding: '0 20px'
                  }}>
                    <span style={{fontSize: '18px', marginRight: '10px'}}>📷</span>
                  </div>
                  
                  {/* Foto de perfil central */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: theme.colors.primary || '#E75A7C',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '15px',
                    marginTop: '30px',
                    border: '4px solid rgba(255,255,255,0.1)',
                    fontSize: '32px',
                    color: 'white',
                    fontWeight: 'bold',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {userData.foto ? (
                      <img src={userData.foto} alt="Foto de perfil" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <div>UU</div>
                    )}
                  </div>
                  
                  {/* Botón de cambiar foto */}
                  <button style={{
                    backgroundColor: theme.colors.primary || '#E75A7C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📷</span> Cambiar foto
                  </button>
                </div>
                
                {/* Formulario con grid */}
                <div style={{ 
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '20px',
                  borderRadius: '12px',
                  padding: '15px',
                  boxSizing: 'border-box',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  maxHeight: 'calc(100vh - 300px)',
                  overflow: 'auto',
                  scrollbarWidth: 'thin'
                }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="nombre" style={{ marginBottom: '5px', display: 'block', fontSize: '14px' }}>Nombre</label>
                    <input 
                      type="text" 
                      id="nombre" 
                      name="nombre" 
                      className="form-control" 
                      value={userData.nombre}
                      onChange={handleInputChange}
                      style={{ 
                        height: '38px',
                        padding: '0 10px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '100%',
                        color: 'white'
                      }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="apellido" style={{ marginBottom: '5px', display: 'block', fontSize: '14px' }}>Apellido</label>
                    <input 
                      type="text" 
                      id="apellido" 
                      name="apellido" 
                      className="form-control" 
                      value={userData.apellido}
                      onChange={handleInputChange}
                      style={{ 
                        height: '38px',
                        padding: '0 10px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '100%',
                        color: 'white'
                      }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="correo" style={{ marginBottom: '5px', display: 'block', fontSize: '14px' }}>Correo</label>
                    <input 
                      type="email" 
                      id="correo" 
                      name="correo" 
                      className="form-control" 
                      value={userData.correo}
                      onChange={handleInputChange}
                      disabled
                      style={{ 
                        height: '38px',
                        padding: '0 10px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '100%',
                        color: 'rgba(255,255,255,0.7)'
                      }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="rol" style={{ marginBottom: '5px', display: 'block', fontSize: '14px' }}>Rol</label>
                    <input 
                      type="text" 
                      id="rol" 
                      name="rol" 
                      className="form-control" 
                      value={userData.rol}
                      onChange={handleInputChange}
                      disabled
                      style={{ 
                        height: '38px',
                        padding: '0 10px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '100%',
                        color: 'rgba(255,255,255,0.7)'
                      }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="carrera" style={{ marginBottom: '5px', display: 'block', fontSize: '14px' }}>Carrera</label>
                    <input 
                      type="text" 
                      id="carrera" 
                      name="carrera" 
                      className="form-control" 
                      value={userData.carrera}
                      onChange={handleInputChange}
                      style={{ 
                        height: '38px',
                        padding: '0 10px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '100%',
                        color: 'white'
                      }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="semestre" style={{ marginBottom: '5px', display: 'block', fontSize: '14px' }}>Semestre</label>
                    <input 
                      type="number" 
                      id="semestre" 
                      name="semestre" 
                      className="form-control" 
                      value={userData.semestre}
                      onChange={handleInputChange}
                      style={{ 
                        height: '38px',
                        padding: '0 10px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '100%',
                        color: 'white'
                      }}
                    />
                  </div>
                </div>
                
                {/* Botón de guardar */}
                <div style={{ 
                  marginTop: '20px', 
                  display: 'flex', 
                  justifyContent: 'flex-end' 
                }}>
                  <button 
                    onClick={handleSaveChanges}
                    style={{ 
                      backgroundColor: theme.colors.primary || '#E75A7C',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '10px 25px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>💾</span> Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      
      case 'cuenta':
        return (
          <>
            <h2 className="profile-section-title" style={{ marginTop: '0', paddingTop: '0' }}>Cuenta</h2>
            
            <div style={{ 
              backgroundColor: '#2B2B33',
              borderRadius: '20px',
              padding: '30px',
              boxSizing: 'border-box',
              maxWidth: '600px',
              maxHeight: 'calc(100vh - 150px)', 
              overflow: 'auto',
              scrollbarWidth: 'thin'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="current-password" style={{ marginBottom: '5px', display: 'block', fontSize: '14px' }}>Contraseña Actual</label>
                  <input 
                    type="password" 
                    id="current-password" 
                    className="form-control" 
                    style={{ 
                      height: '38px',
                      padding: '0 10px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      width: '100%',
                      color: 'white'
                    }}
                  />
                </div>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="new-password" style={{ marginBottom: '5px', display: 'block', fontSize: '14px' }}>Nueva Contraseña</label>
                  <input 
                    type="password" 
                    id="new-password" 
                    className="form-control" 
                    style={{ 
                      height: '38px',
                      padding: '0 10px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      width: '100%',
                      color: 'white'
                    }}
                  />
                </div>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="confirm-password" style={{ marginBottom: '5px', display: 'block', fontSize: '14px' }}>Confirmar Nueva Contraseña</label>
                  <input 
                    type="password" 
                    id="confirm-password" 
                    className="form-control" 
                    style={{ 
                      height: '38px',
                      padding: '0 10px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      width: '100%',
                      color: 'white'
                    }}
                  />
                </div>
                
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="save-profile-btn" 
                    style={{ 
                      backgroundColor: theme.colors.primary || '#E75A7C',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '10px 25px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>🔄</span> Actualizar Contraseña
                  </button>
                </div>
              </div>
            </div>
          </>
        );
        
      case 'apariencia':
        return (
          <>
            <h2 className="profile-section-title" style={{ marginTop: '0', paddingTop: '0' }}>Apariencia</h2>
            
            <div style={{ 
              backgroundColor: '#2B2B33',
              borderRadius: '20px',
              padding: '30px',
              boxSizing: 'border-box',
              maxWidth: '600px',
              maxHeight: 'calc(100vh - 150px)', 
              overflow: 'auto',
              scrollbarWidth: 'thin'
            }}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label style={{ fontSize: '15px', marginBottom: '15px', display: 'block' }}>Tema de la aplicación</label>
                <div className="theme-selector" style={{ 
                  display: 'flex', 
                  gap: '15px'
                }}>
                  <div className="theme-option" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    padding: '12px 20px', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="radio" 
                      id="theme-light" 
                      name="theme" 
                      style={{ marginRight: '10px' }}
                    />
                    <label 
                      htmlFor="theme-light" 
                      style={{ cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span style={{ fontSize: '16px' }}>☀️</span> Claro
                    </label>
                  </div>
                  <div className="theme-option" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: theme.colors.primary || '#E75A7C',
                    padding: '12px 20px', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="radio" 
                      id="theme-dark" 
                      name="theme" 
                      defaultChecked 
                      style={{ marginRight: '10px' }}
                    />
                    <label 
                      htmlFor="theme-dark" 
                      style={{ cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span style={{ fontSize: '16px' }}>🌙</span> Oscuro
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
        
      case 'notificaciones':
        return (
          <>
            <h2 className="profile-section-title" style={{ marginTop: '0', paddingTop: '0' }}>Notificaciones</h2>
            
            <div style={{ 
              backgroundColor: '#2B2B33',
              borderRadius: '20px',
              padding: '25px',
              boxSizing: 'border-box',
              maxWidth: '600px',
              maxHeight: 'calc(100vh - 150px)', 
              overflow: 'auto',
              scrollbarWidth: 'thin'
            }}>
              {['Mensajes', 'Comentarios', 'Solicitudes de Amistad', 'Publicaciones'].map((item, index) => (
                <div 
                  key={index} 
                  className="notification-option" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: index === 3 ? '0' : '20px',
                    alignItems: 'center',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0,0,0,0.15)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{item}</div>
                    <div style={{ fontSize: '13px', color: '#aaa', marginTop: '3px' }}>
                      Recibir notificaciones de {item.toLowerCase()}
                    </div>
                  </div>
                  <label className="switch" style={{ 
                    position: 'relative',
                    display: 'inline-block',
                    width: '44px',
                    height: '22px'
                  }}>
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      style={{ 
                        opacity: '0',
                        width: '0',
                        height: '0'
                      }} 
                    />
                    <span className="slider round" style={{ 
                      position: 'absolute',
                      cursor: 'pointer',
                      top: '0',
                      left: '0',
                      right: '0',
                      bottom: '0',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '34px',
                      transition: '0.3s'
                    }}></span>
                  </label>
                </div>
              ))}
            </div>
          </>
        );
        
      case 'privacidad':
        return (
          <>
            <h2 className="profile-section-title" style={{ marginTop: '0', paddingTop: '0' }}>Privacidad</h2>
            
            <div style={{ 
              backgroundColor: '#2B2B33',
              borderRadius: '20px',
              padding: '25px',
              boxSizing: 'border-box',
              maxWidth: '600px',
              maxHeight: 'calc(100vh - 150px)', 
              overflow: 'auto',
              scrollbarWidth: 'thin'
            }}>
              {['Perfil Público', 'Mostrar Estado en Línea', 'Permitir Mensajes de Desconocidos', 'Mostrar Actividad Reciente'].map((item, index) => (
                <div 
                  key={index} 
                  className="privacy-option" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: index === 3 ? '0' : '20px',
                    alignItems: 'center',
                    padding: '12px 15px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0,0,0,0.15)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{item}</div>
                    <div style={{ fontSize: '13px', color: '#aaa', marginTop: '3px' }}>
                      Configuración para {item.toLowerCase()}
                    </div>
                  </div>
                  <label className="switch" style={{ 
                    position: 'relative',
                    display: 'inline-block',
                    width: '44px',
                    height: '22px'
                  }}>
                    <input 
                      type="checkbox" 
                      defaultChecked={index !== 2} 
                      style={{ 
                        opacity: '0',
                        width: '0',
                        height: '0'
                      }} 
                    />
                    <span className="slider round" style={{ 
                      position: 'absolute',
                      cursor: 'pointer',
                      top: '0',
                      left: '0',
                      right: '0',
                      bottom: '0',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '34px',
                      transition: '0.3s'
                    }}></span>
                  </label>
                </div>
              ))}
            </div>
          </>
        );
      
      default:
        return <div>Selecciona una sección</div>;
    }
  };

  return (
    <div className="profile-settings-container" style={{ 
      maxHeight: '100vh', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '20px',
      backgroundColor: '#242429'
    }}>
      <div className="profile-header" style={{ 
        paddingTop: '15px', 
        paddingBottom: '15px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          <div className="profile-logo" style={{ 
            width: '50px', 
            height: '50px',
            borderRadius: '50%',
            backgroundColor: theme.colors.primary || '#E75A7C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white',
            marginRight: '15px'
          }}>
            US
          </div>
          <h1 className="profile-title" style={{ fontSize: '22px', margin: 0 }}>Configuración</h1>
        </div>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.1)',
          cursor: 'pointer'
        }}>
          <span style={{ fontSize: '18px' }}>✖</span>
        </div>
      </div>
      
      <div className="profile-content" style={{ 
        paddingTop: '0', 
        height: 'calc(100% - 80px)', 
        overflow: 'hidden',
        flex: 1,
        display: 'flex',
        position: 'relative',
        background: '#242429'
      }}>
        <div className="profile-sidebar" style={{ 
          overflowY: 'auto', 
          scrollbarWidth: 'thin',
          flex: '0 0 200px',
          background: '#242429',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 0'
        }}>
          <div 
            className={`profile-nav-item ${activeSection === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveSection('perfil')}
            style={{ 
              padding: '12px 20px', 
              display: 'flex', 
              alignItems: 'center',
              borderLeft: activeSection === 'perfil' ? `3px solid ${theme.colors.primary || '#E75A7C'}` : '3px solid transparent',
              backgroundColor: activeSection === 'perfil' ? 'rgba(255,255,255,0.05)' : 'transparent'
            }}
          >
            <span className="profile-nav-item-icon" style={{ marginRight: '12px', fontSize: '16px' }}>👤</span> Perfil
          </div>
          <div 
            className={`profile-nav-item ${activeSection === 'cuenta' ? 'active' : ''}`}
            onClick={() => setActiveSection('cuenta')}
            style={{ 
              padding: '12px 20px', 
              display: 'flex', 
              alignItems: 'center',
              borderLeft: activeSection === 'cuenta' ? `3px solid ${theme.colors.primary || '#E75A7C'}` : '3px solid transparent',
              backgroundColor: activeSection === 'cuenta' ? 'rgba(255,255,255,0.05)' : 'transparent'
            }}
          >
            <span className="profile-nav-item-icon" style={{ marginRight: '12px', fontSize: '16px' }}>🔑</span> Cuenta
          </div>
          <div 
            className={`profile-nav-item ${activeSection === 'apariencia' ? 'active' : ''}`}
            onClick={() => setActiveSection('apariencia')}
            style={{ 
              padding: '12px 20px', 
              display: 'flex', 
              alignItems: 'center',
              borderLeft: activeSection === 'apariencia' ? `3px solid ${theme.colors.primary || '#E75A7C'}` : '3px solid transparent',
              backgroundColor: activeSection === 'apariencia' ? 'rgba(255,255,255,0.05)' : 'transparent'
            }}
          >
            <span className="profile-nav-item-icon" style={{ marginRight: '12px', fontSize: '16px' }}>🎨</span> Apariencia
          </div>
          <div 
            className={`profile-nav-item ${activeSection === 'notificaciones' ? 'active' : ''}`}
            onClick={() => setActiveSection('notificaciones')}
            style={{ 
              padding: '12px 20px', 
              display: 'flex', 
              alignItems: 'center',
              borderLeft: activeSection === 'notificaciones' ? `3px solid ${theme.colors.primary || '#E75A7C'}` : '3px solid transparent',
              backgroundColor: activeSection === 'notificaciones' ? 'rgba(255,255,255,0.05)' : 'transparent'
            }}
          >
            <span className="profile-nav-item-icon" style={{ marginRight: '12px', fontSize: '16px' }}>🔔</span> Notificaciones
          </div>
          <div 
            className={`profile-nav-item ${activeSection === 'privacidad' ? 'active' : ''}`}
            onClick={() => setActiveSection('privacidad')}
            style={{ 
              padding: '12px 20px', 
              display: 'flex', 
              alignItems: 'center',
              borderLeft: activeSection === 'privacidad' ? `3px solid ${theme.colors.primary || '#E75A7C'}` : '3px solid transparent',
              backgroundColor: activeSection === 'privacidad' ? 'rgba(255,255,255,0.05)' : 'transparent'
            }}
          >
            <span className="profile-nav-item-icon" style={{ marginRight: '12px', fontSize: '16px' }}>🔒</span> Privacidad
          </div>
          <div 
            className="profile-nav-item" 
            onClick={logout} 
            style={{ 
              marginTop: '30px', 
              color: '#ff6b6b',
              padding: '12px 20px', 
              display: 'flex', 
              alignItems: 'center'
            }}
          >
            <span className="profile-nav-item-icon" style={{ marginRight: '12px', fontSize: '16px' }}>🚪</span> Cerrar Sesión
          </div>
        </div>
        
        <div className="profile-main" style={{ 
          flex: 1,
          height: '100%',
          overflow: 'auto',
          scrollbarWidth: 'thin',
          padding: '20px'
        }}>
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModuleNew;