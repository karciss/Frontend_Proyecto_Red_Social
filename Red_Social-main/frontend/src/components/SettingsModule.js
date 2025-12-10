import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { uploadFiles } from '../services/uploadService';
import api from '../services/api';
import '../styles/SettingsModule.css';
import '../styles/ThemeOptions.css';

const SettingsModule = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { user, logout, updateUser } = useAuth();
  
  // Estados para las secciones de configuración
  const [activeTab, setActiveTab] = useState('cuenta');
  
  // Estados para foto de perfil
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Estados para modales de mensajes
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalConfig, setMessageModalConfig] = useState({
    type: 'success',
    title: '',
    message: ''
  });
  
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

  // Función para manejar la selección de archivo de foto
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('📸 Archivo seleccionado:', file.name);
    
    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      setMessageModalConfig({
        type: 'error',
        title: 'Archivo no válido',
        message: 'Solo se permiten imágenes (JPG, PNG, GIF, WebP)'
      });
      setShowMessageModal(true);
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessageModalConfig({
        type: 'error',
        title: 'Archivo muy grande',
        message: 'La imagen no debe superar 5MB'
      });
      setShowMessageModal(true);
      return;
    }
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('✅ Preview generado');
      setPreviewPhoto(reader.result);
      setSelectedFile(file);
      setShowPhotoModal(true);
    };
    reader.readAsDataURL(file);
    
    // Limpiar el input
    e.target.value = '';
  };

  // Función para confirmar cambio de foto
  const handleConfirmPhotoChange = async () => {
    if (!selectedFile) return;
    
    console.log('🚀 Iniciando subida de foto...');
    
    try {
      setShowPhotoModal(false);
      setUploadingPhoto(true);
      
      // Subir archivo
      console.log('📤 Subiendo archivo...');
      const { data: urls, error } = await uploadFiles([selectedFile]);
      
      if (error) {
        console.error('❌ Error al subir:', error);
        setMessageModalConfig({
          type: 'error',
          title: 'Error al subir',
          message: error
        });
        setShowMessageModal(true);
        setUploadingPhoto(false);
        return;
      }
      
      console.log('✅ Archivo subido:', urls[0]);
      
      // Actualizar usuario en el backend
      console.log('💾 Actualizando usuario en BD...');
      await api.put(`/usuarios/${user.id_user}`, {
        foto_perfil: urls[0]
      });
      
      console.log('✅ Usuario actualizado en BD');
      
      // Actualizar contexto y localStorage
      const updatedUser = { ...user, foto_perfil: urls[0] };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('user-data', JSON.stringify(updatedUser));
      
      // Actualizar en el contexto
      if (updateUser) {
        updateUser({ foto_perfil: urls[0] });
      }
      
      setMessageModalConfig({
        type: 'success',
        title: '¡Foto actualizada!',
        message: 'Tu foto de perfil se ha actualizado correctamente'
      });
      setShowMessageModal(true);
      
      // Recargar después de 1.5s
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error completo:', err);
      setMessageModalConfig({
        type: 'error',
        title: 'Error al cambiar foto',
        message: err.message || 'Ocurrió un error inesperado'
      });
      setShowMessageModal(true);
      setUploadingPhoto(false);
    } finally {
      setSelectedFile(null);
      setPreviewPhoto(null);
    }
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
            <>
              <div className="settings-section">
                <h3 className="settings-section-title">Información del Perfil</h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px 0',
                  borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                  marginBottom: '20px'
                }}>
                  <div style={{position: 'relative', marginBottom: '15px'}}>
                    <img
                      src={user.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=667eea&color=fff&size=150`}
                      alt={user.nombre}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid var(--primary-color, #667eea)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('settings-photo-input').click()}
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        background: 'var(--primary-color, #667eea)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      📷
                    </button>
                  </div>
                  <h4 style={{color: 'var(--text-primary)', margin: '0 0 5px 0'}}>{user.nombre}</h4>
                  <p style={{color: 'var(--text-secondary)', fontSize: '14px', margin: '0'}}>@{user.username}</p>
                </div>
              </div>

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
            </>
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
        </div>
      </div>

      {/* Input oculto para seleccionar foto */}
      <input
        type="file"
        id="settings-photo-input"
        accept="image/*"
        onChange={handlePhotoSelect}
        style={{ display: 'none' }}
      />

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
          zIndex: 9999
        }}>
          <div style={{
            background: 'var(--card-bg, #1a1d25)',
            borderRadius: '12px',
            padding: '25px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <h3 style={{
              color: 'var(--text-primary)',
              marginTop: 0,
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Nueva Foto de Perfil
            </h3>
            
            {previewPhoto && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <img
                  src={previewPhoto}
                  alt="Preview"
                  style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--primary-color, #667eea)'
                  }}
                />
              </div>
            )}
            
            <p style={{
              color: 'var(--text-secondary)',
              textAlign: 'center',
              marginBottom: '25px',
              fontSize: '14px'
            }}>
              ¿Deseas usar esta foto como tu foto de perfil?
            </p>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  setPreviewPhoto(null);
                  setSelectedFile(null);
                }}
                disabled={uploadingPhoto}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                  opacity: uploadingPhoto ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPhotoChange}
                disabled={uploadingPhoto}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary-color, #667eea)',
                  color: 'white',
                  cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                  opacity: uploadingPhoto ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {uploadingPhoto ? 'Subiendo...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de mensajes (éxito/error) */}
      {showMessageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: 'var(--card-bg, #1a1d25)',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              {messageModalConfig.type === 'success' ? '✅' : '⚠️'}
            </div>
            
            <h3 style={{
              color: 'var(--text-primary)',
              marginTop: 0,
              marginBottom: '15px',
              fontSize: '22px',
              fontWeight: '600'
            }}>
              {messageModalConfig.title}
            </h3>
            
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '25px',
              fontSize: '15px',
              lineHeight: '1.5'
            }}>
              {messageModalConfig.message}
            </p>
            
            <button
              onClick={() => setShowMessageModal(false)}
              style={{
                padding: '12px 32px',
                borderRadius: '8px',
                border: 'none',
                background: messageModalConfig.type === 'success' ? '#4CAF50' : 'var(--primary-color, #667eea)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '15px',
                fontWeight: '500'
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModule;