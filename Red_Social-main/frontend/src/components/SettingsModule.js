import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import '../styles/SettingsModule.css';
import '../styles/ThemeOptions.css';

const SettingsModule = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  
  // Estados para las secciones de configuración
  const [activeTab, setActiveTab] = useState('cuenta');
  
  // Estados para privacidad
  const [privacySettings, setPrivacySettings] = useState({
    perfilPublico: true,
    mostrarEstado: false,
    permitirMensajes: true,
    actividadVisible: false
  });
  
  // Estados para notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    mensajes: true,
    publicaciones: false,
    comentarios: true,
    eventos: false
  });
  
  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Datos del usuario
  const userData = user || {
    nombre: 'Usuario',
    apellido: 'Ejemplo',
    correo: 'usuario@example.com',
    rol: 'estudiante',
    carrera: 'Ingeniería en Sistemas',
    semestre: 5
  };
  
  // Función para manejar cambios en privacidad
  const handlePrivacyToggle = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Función para manejar cambios en notificaciones
  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Función para cambiar contraseña
  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Todos los campos son obligatorios');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    // Aquí iría la llamada a la API para cambiar la contraseña
    setPasswordSuccess('Contraseña actualizada correctamente');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="settings-logo">RSU</div>
        <h2 className="settings-title">Configuración</h2>
      </div>
      
      <div className="settings-content">
        <div className="settings-sidebar">
          <div 
            className={`settings-nav-item ${activeTab === 'cuenta' ? 'active' : ''}`}
            onClick={() => setActiveTab('cuenta')}
          >
            <span className="settings-nav-item-icon">🔑</span>
            Cuenta
          </div>
          <div 
            className={`settings-nav-item ${activeTab === 'apariencia' ? 'active' : ''}`}
            onClick={() => setActiveTab('apariencia')}
          >
            <span className="settings-nav-item-icon">🎨</span>
            Apariencia
          </div>
          <div 
            className={`settings-nav-item ${activeTab === 'notificaciones' ? 'active' : ''}`}
            onClick={() => setActiveTab('notificaciones')}
          >
            <span className="settings-nav-item-icon">🔔</span>
            Notificaciones
          </div>
          <div 
            className={`settings-nav-item ${activeTab === 'privacidad' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacidad')}
          >
            <span className="settings-nav-item-icon">🔒</span>
            Privacidad
          </div>
          <div 
            className="settings-nav-item logout-btn"
            onClick={logout}
            style={{ marginTop: '30px', color: 'var(--error-color, #ff6b6b)' }}
          >
            <span className="settings-nav-item-icon">🚪</span>
            Cerrar Sesión
          </div>
        </div>
        
        <div className="settings-main">
          {activeTab === 'apariencia' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Apariencia</h3>
              
              <div>
                <h4 style={{color: 'var(--text-primary)', marginBottom: '15px'}}>Tema</h4>
                
                <div className="theme-options" style={{cursor: 'pointer'}}>
                  {/* Tema Oscuro - único disponible */}
                  <div 
                    className="theme-option dark-theme active"
                    style={{cursor: 'default'}}
                  >
                    <div className="theme-preview" style={{pointerEvents: 'none'}}>
                      <div style={{
                        width: '80%',
                        height: '70%',
                        background: '#2d2d35',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        pointerEvents: 'none'
                      }}>
                        <div style={{height: '20%', background: '#1e1e24', borderBottom: '1px solid #3a3a43'}}></div>
                        <div style={{padding: '5px', display: 'flex', flexDirection: 'column', gap: '3px'}}>
                          <div style={{height: '8px', width: '70%', background: '#3a3a43', borderRadius: '2px'}}></div>
                          <div style={{height: '8px', width: '50%', background: '#3a3a43', borderRadius: '2px'}}></div>
                        </div>
                      </div>
                    </div>
                    <p style={{pointerEvents: 'none'}}>Tema Oscuro</p>
                    <div className="theme-check" style={{pointerEvents: 'none'}}>✓</div>
                  </div>
                  
                  {/* Tema Colorido (próximamente) */}
                  <div className="theme-option colorful-theme" style={{opacity: '0.7', cursor: 'not-allowed'}}>
                    <div className="theme-preview" style={{pointerEvents: 'none'}}>
                      <div style={{
                        width: '80%',
                        height: '70%',
                        background: 'linear-gradient(135deg, #2d2d35 0%, #2d3e76 100%)',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        pointerEvents: 'none'
                      }}>
                        <div style={{height: '20%', background: 'linear-gradient(135deg, #1e1e24 0%, #9c2766 100%)', borderBottom: '1px solid #9c2766'}}></div>
                        <div style={{padding: '5px', display: 'flex', flexDirection: 'column', gap: '3px'}}>
                          <div style={{height: '8px', width: '70%', background: 'rgba(255,255,255,0.2)', borderRadius: '2px'}}></div>
                          <div style={{height: '8px', width: '50%', background: 'rgba(255,255,255,0.2)', borderRadius: '2px'}}></div>
                        </div>
                      </div>
                    </div>
                    <p style={{pointerEvents: 'none'}}>Colorido (Próximamente)</p>
                    <div className="coming-soon" style={{
                      position: 'absolute', 
                      bottom: '10px', 
                      right: '10px', 
                      background: theme.colors.primary, 
                      color: 'white', 
                      fontSize: '10px', 
                      padding: '2px 8px', 
                      borderRadius: '10px',
                      pointerEvents: 'none'
                    }}>Próximamente</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'cuenta' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Seguridad de la Cuenta</h3>
              
              <form className="password-change" onSubmit={handlePasswordChange}>
                <h4 style={{color: 'var(--text-primary)', marginBottom: '15px'}}>Cambiar Contraseña</h4>
                
                {passwordError && (
                  <div style={{
                    background: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    color: '#f44336',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    fontSize: '14px'
                  }}>
                    {passwordError}
                  </div>
                )}
                
                {passwordSuccess && (
                  <div style={{
                    background: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    color: '#4CAF50',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    fontSize: '14px'
                  }}>
                    {passwordSuccess}
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="current-password">Contraseña Actual</label>
                  <input 
                    type="password" 
                    id="current-password" 
                    className="form-control"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="new-password">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    id="new-password" 
                    className="form-control"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirmar Nueva Contraseña</label>
                  <input 
                    type="password" 
                    id="confirm-password" 
                    className="form-control"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
                
                <button 
                  type="submit"
                  className="save-changes-btn"
                >
                  Actualizar Contraseña
                </button>
              </form>
            </div>
          )}
          
          {activeTab === 'notificaciones' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Configuración de Notificaciones</h3>
              
              <div>
                {Object.entries({
                  mensajes: {
                    title: 'Notificaciones de mensajes',
                    description: 'Recibir notificaciones cuando recibas nuevos mensajes'
                  },
                  publicaciones: {
                    title: 'Notificaciones de publicaciones',
                    description: 'Recibir notificaciones cuando recibas nuevas publicaciones'
                  },
                  comentarios: {
                    title: 'Notificaciones de comentarios',
                    description: 'Recibir notificaciones cuando recibas nuevos comentarios'
                  },
                  eventos: {
                    title: 'Notificaciones de eventos',
                    description: 'Recibir notificaciones cuando recibas nuevos eventos'
                  }
                }).map(([key, value]) => (
                  <div key={key} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px 0',
                    borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))'
                  }}>
                    <div>
                      <div style={{fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px'}}>
                        {value.title}
                      </div>
                      <div style={{fontSize: '13px', color: 'var(--text-secondary)'}}>
                        {value.description}
                      </div>
                    </div>
                    <label 
                      onClick={() => handleNotificationToggle(key)}
                      style={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '50px',
                        height: '28px',
                        cursor: 'pointer'
                      }}>
                      <input 
                        type="checkbox" 
                        checked={notificationSettings[key]} 
                        onChange={() => {}}
                        style={{opacity: 0, width: 0, height: 0}} 
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: notificationSettings[key] ? theme.colors.primary : 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '34px',
                        transition: '.4s'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '20px',
                          width: '20px',
                          left: notificationSettings[key] ? '26px' : '4px',
                          bottom: '4px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: '.4s'
                        }}></span>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'privacidad' && (
            <div className="settings-section">
              <h3 className="settings-section-title">Configuración de Privacidad</h3>
              
              <div>
                {Object.entries({
                  perfilPublico: {
                    title: 'Perfil público',
                    description: 'Controla quién puede ver tu perfil'
                  },
                  mostrarEstado: {
                    title: 'Mostrar estado',
                    description: 'Controla quién puede ver tu estado en línea'
                  },
                  permitirMensajes: {
                    title: 'Permitir mensajes',
                    description: 'Controla quién puede ver tu enviarte mensajes'
                  },
                  actividadVisible: {
                    title: 'Actividad visible',
                    description: 'Controla quién puede ver tu actividad reciente'
                  }
                }).map(([key, value]) => (
                  <div key={key} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px 0',
                    borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))'
                  }}>
                    <div>
                      <div style={{fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px'}}>
                        {value.title}
                      </div>
                      <div style={{fontSize: '13px', color: 'var(--text-secondary)'}}>
                        {value.description}
                      </div>
                    </div>
                    <label 
                      onClick={() => handlePrivacyToggle(key)}
                      style={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '50px',
                        height: '28px',
                        cursor: 'pointer'
                      }}>
                      <input 
                        type="checkbox" 
                        checked={privacySettings[key]} 
                        onChange={() => {}}
                        style={{opacity: 0, width: 0, height: 0}} 
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: privacySettings[key] ? theme.colors.primary : 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '34px',
                        transition: '.4s'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '20px',
                          width: '20px',
                          left: privacySettings[key] ? '26px' : '4px',
                          bottom: '4px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: '.4s'
                        }}></span>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;