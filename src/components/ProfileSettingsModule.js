import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfileSettings.css';
import '../styles/switchStyles.css';

const ProfileSettingsModule = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  
  // Estado para la sección activa
  const [activeSection, setActiveSection] = useState('cuenta');
  
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
      case 'cuenta':
        return (
          <>
            <h2 className="profile-section-title" style={{ marginTop: '0', paddingTop: '0' }}>Cuenta</h2>
            
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '20px',
              boxSizing: 'border-box',
              maxWidth: '600px',
              maxHeight: 'calc(100vh - 150px)', 
              overflow: 'auto',
              scrollbarWidth: 'thin'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="current-password" style={{ marginBottom: '5px', display: 'block', fontSize: '13px' }}>Contraseña Actual</label>
                  <input 
                    type="password" 
                    id="current-password" 
                    className="form-control" 
                    style={{ height: '36px', padding: '0 10px' }}
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="new-password" style={{ marginBottom: '5px', display: 'block', fontSize: '13px' }}>Nueva Contraseña</label>
                  <input 
                    type="password" 
                    id="new-password" 
                    className="form-control" 
                    style={{ height: '36px', padding: '0 10px' }}
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="confirm-password" style={{ marginBottom: '5px', display: 'block', fontSize: '13px' }}>Confirmar Nueva Contraseña</label>
                  <input 
                    type="password" 
                    id="confirm-password" 
                    className="form-control" 
                    style={{ height: '36px', padding: '0 10px' }}
                  />
                </div>
                
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="save-profile-btn" 
                    style={{ 
                      backgroundColor: theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '8px 20px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
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
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '20px',
              boxSizing: 'border-box',
              maxWidth: '600px',
              maxHeight: 'calc(100vh - 150px)', 
              overflow: 'auto',
              scrollbarWidth: 'thin'
            }}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label style={{ fontSize: '15px', marginBottom: '10px', display: 'block' }}>Tema de la aplicación</label>
                <div className="theme-selector" style={{ 
                  display: 'flex', 
                  gap: '15px', 
                  marginTop: '10px'
                }}>
                  <div className="theme-option" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    padding: '10px 15px', 
                    borderRadius: '6px', 
                    cursor: 'pointer' 
                  }}>
                    <input 
                      type="radio" 
                      id="theme-light" 
                      name="theme" 
                      style={{ marginRight: '8px' }}
                    />
                    <label 
                      htmlFor="theme-light" 
                      style={{ cursor: 'pointer', fontSize: '14px' }}
                    >
                      ☀️ Claro
                    </label>
                  </div>
                  <div className="theme-option" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    padding: '10px 15px', 
                    borderRadius: '6px', 
                    cursor: 'pointer' 
                  }}>
                    <input 
                      type="radio" 
                      id="theme-dark" 
                      name="theme" 
                      defaultChecked 
                      style={{ marginRight: '8px' }}
                    />
                    <label 
                      htmlFor="theme-dark" 
                      style={{ cursor: 'pointer', fontSize: '14px' }}
                    >
                      🌙 Oscuro
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
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '15px 20px',
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
                    marginBottom: index === 3 ? '0' : '15px',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: index === 3 ? 'none' : '1px solid rgba(255,255,255,0.08)'
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
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '15px 20px',
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
                    marginBottom: index === 3 ? '0' : '15px',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: index === 3 ? 'none' : '1px solid rgba(255,255,255,0.08)'
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
          scrollbarWidth: 'thin'
        }}>
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModule;