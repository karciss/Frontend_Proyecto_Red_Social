import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { uploadFiles } from '../services/uploadService';
import api from '../services/api';
import '../styles/ProfileSettings.css';
import '../styles/switchStyles.css';

const ProfileSettingsModuleNew = () => {
  const { theme } = useTheme();
  const { user, logout, updateUser } = useAuth();
  
  // Estado para la sección activa
  const [activeSection, setActiveSection] = useState('perfil');
  
  // Estados para el cambio de foto
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Estados para modales de mensajes
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalConfig, setMessageModalConfig] = useState({
    type: 'success', // 'success' | 'error'
    title: '',
    message: ''
  });
  
  // Estado para los datos del usuario
  const [userData, setUserData] = useState({
    nombre: user?.nombre || 'Usuario de Prueba',
    apellido: user?.apellido || '',
    correo: user?.correo || 'usuario@ejemplo.com',
    rol: user?.rol || 'estudiante',
    carrera: user?.carrera || 'Informática',
    semestre: user?.semestre || '5',
    foto: user?.foto_perfil || null,
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

  // Manejador para seleccionar foto
  const handlePhotoSelect = (e) => {
    console.log('📸 Archivo seleccionado en ProfileSettings');
    const file = e.target.files[0];
    if (!file) return;
    
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
    
    console.log('✅ Archivo válido, generando preview');
    // Mostrar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('✅ Preview generado, mostrando modal');
      setPreviewPhoto(reader.result);
      setSelectedFile(file);
      setShowPhotoModal(true);
    };
    reader.readAsDataURL(file);
    
    // Limpiar el input
    e.target.value = '';
  };

  // Manejador para confirmar el cambio de foto
  const handleConfirmPhotoChange = async () => {
    if (!selectedFile) return;
    
    console.log('🚀 Iniciando subida de foto desde ProfileSettings');
    setUploadingPhoto(true);
    
    try {
      // 1. Subir archivo a Supabase
      console.log('📤 Subiendo archivo a Supabase...');
      console.log('📁 Archivo a subir:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      
      const uploadResult = await uploadFiles([selectedFile]);
      
      console.log('📦 Resultado completo de upload:', JSON.stringify(uploadResult, null, 2));
      
      if (uploadResult.error) {
        console.error('❌ Error en uploadResult:', uploadResult.error);
        setMessageModalConfig({
          type: 'error',
          title: 'Error al subir',
          message: uploadResult.error
        });
        setShowMessageModal(true);
        setUploadingPhoto(false);
        return;
      }
      
      if (!uploadResult.data || uploadResult.data.length === 0) {
        console.error('❌ No se recibieron URLs en la respuesta');
        setMessageModalConfig({
          type: 'error',
          title: 'Error al subir',
          message: 'No se pudo obtener la URL de la imagen'
        });
        setShowMessageModal(true);
        setUploadingPhoto(false);
        return;
      }
      
      const fotoUrl = uploadResult.data[0];
      console.log('✅ Archivo subido exitosamente:', fotoUrl);
      
      // 2. Actualizar en la base de datos
      console.log('💾 Actualizando usuario en base de datos...');
      await api.put(`/usuarios/${user.id_user}`, {
        foto_perfil: fotoUrl
      });
      console.log('✅ Usuario actualizado en BD');
      
      // 3. Actualizar estado local y contexto
      setUserData(prev => ({ ...prev, foto: fotoUrl }));
      updateUser({ foto_perfil: fotoUrl });
      
      // 4. Cerrar modal y limpiar estados
      setShowPhotoModal(false);
      setPreviewPhoto(null);
      setSelectedFile(null);
      
      setMessageModalConfig({
        type: 'success',
        title: '¡Foto actualizada!',
        message: 'Tu foto de perfil se ha actualizado correctamente'
      });
      setShowMessageModal(true);
      
      // 5. Recargar página para reflejar cambios
      console.log('🔄 Recargando página...');
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (error) {
      console.error('❌ Error al cambiar foto:', error);
      setMessageModalConfig({
        type: 'error',
        title: 'Error al cambiar foto',
        message: error.message || error
      });
      setShowMessageModal(true);
    } finally {
      setUploadingPhoto(false);
    }
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
                  <button 
                    onClick={() => document.getElementById('profile-settings-photo-input').click()}
                    style={{
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

      {/* Input oculto para seleccionar foto */}
      <input
        type="file"
        id="profile-settings-photo-input"
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
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: '#2a2d35',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)'
          }}>
            <h3 style={{
              color: 'white',
              marginTop: 0,
              marginBottom: '25px',
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: '600'
            }}>
              Nueva Foto de Perfil
            </h3>
            
            {previewPhoto && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '25px'
              }}>
                <img
                  src={previewPhoto}
                  alt="Preview"
                  style={{
                    width: '220px',
                    height: '220px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #E75A7C'
                  }}
                />
              </div>
            )}
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              marginBottom: '30px',
              fontSize: '15px'
            }}>
              ¿Deseas usar esta foto como tu foto de perfil?
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
                disabled={uploadingPhoto}
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                  opacity: uploadingPhoto ? 0.5 : 1,
                  transition: 'all 0.2s',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPhotoChange}
                disabled={uploadingPhoto}
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#E75A7C',
                  color: 'white',
                  cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                  opacity: uploadingPhoto ? 0.5 : 1,
                  transition: 'all 0.2s',
                  fontSize: '15px',
                  fontWeight: '500'
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
            background: '#2a2d35',
            borderRadius: '16px',
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
              color: 'white',
              marginTop: 0,
              marginBottom: '15px',
              fontSize: '22px',
              fontWeight: '600'
            }}>
              {messageModalConfig.title}
            </h3>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
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
                borderRadius: '10px',
                border: 'none',
                background: messageModalConfig.type === 'success' ? '#4CAF50' : '#E75A7C',
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

export default ProfileSettingsModuleNew;