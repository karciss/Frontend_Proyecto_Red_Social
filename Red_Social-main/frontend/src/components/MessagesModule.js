import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import mensajeriaService from '../services/mensajeriaService';
import DetailPanel from './DetailPanel';
import '../styles/Messages.css';

const MessagesModule = ({ onSelectItem, selectedItem }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Estado para conversaciones
  const [activeTab, setActiveTab] = useState('recientes');
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNuevoMensaje, setShowNuevoMensaje] = useState(false);
  const [busquedaUsuarios, setBusquedaUsuarios] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [tipoConversacion, setTipoConversacion] = useState('individual'); // 'individual' o 'grupal'
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
  const [nombreGrupo, setNombreGrupo] = useState('');
  
  // Cargar conversaciones al montar
  useEffect(() => {
    loadConversaciones();
  }, []);

  const loadConversaciones = async () => {
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await mensajeriaService.getConversaciones();
    
    if (apiError) {
      setError(apiError);
    } else {
      setConversaciones(data || []);
    }
    setLoading(false);
  };

  const buscarUsuarios = async (query) => {
    if (!query || query.trim().length < 2) {
      setUsuariosEncontrados([]);
      return;
    }
    
    const { data, error: apiError } = await mensajeriaService.buscarUsuarios(query);
    if (!apiError && data) {
      setUsuariosEncontrados(data.filter(u => u.id_user !== user?.id_user));
    }
  };

  const toggleUsuarioSeleccionado = (usuario) => {
    const yaSeleccionado = usuariosSeleccionados.find(u => u.id_user === usuario.id_user);
    if (yaSeleccionado) {
      setUsuariosSeleccionados(usuariosSeleccionados.filter(u => u.id_user !== usuario.id_user));
    } else {
      if (tipoConversacion === 'individual' && usuariosSeleccionados.length >= 1) {
        setUsuariosSeleccionados([usuario]); // Solo uno para conversaciones individuales
      } else {
        setUsuariosSeleccionados([...usuariosSeleccionados, usuario]);
      }
    }
  };

  const crearNuevaConversacion = async () => {
    if (usuariosSeleccionados.length === 0) {
      alert('Selecciona al menos un usuario');
      return;
    }

    if (tipoConversacion === 'grupal' && !nombreGrupo.trim()) {
      alert('Ingresa un nombre para el grupo');
      return;
    }

    const esGrupal = tipoConversacion === 'grupal';
    
    // Para conversaciones individuales, verificar si ya existe
    if (!esGrupal) {
      const otroUsuarioId = usuariosSeleccionados[0].id_user;
      const conversacionExistente = conversaciones.find(conv => 
        !conv.es_grupal && conv.participantes?.some(p => p.id_user === otroUsuarioId)
      );
      
      if (conversacionExistente) {
        // Si existe, abrir la conversación existente
        setShowNuevoMensaje(false);
        setBusquedaUsuarios('');
        setUsuariosEncontrados([]);
        setUsuariosSeleccionados([]);
        handleSelectConversacion(conversacionExistente);
        return;
      }
    }

    const conversacionData = esGrupal ? {
      tipo: 'grupal',
      nombre: nombreGrupo,
      participantes: [user.id_user, ...usuariosSeleccionados.map(u => u.id_user)]
    } : {
      tipo: 'privada',
      participantes: [user.id_user, usuariosSeleccionados[0].id_user]
    };

    const { data, error: apiError } = await mensajeriaService.crearConversacion(conversacionData);

    if (!apiError && data) {
      // Agregar participantes al objeto de datos
      const conversacionConParticipantes = {
        ...data,
        participantes: usuariosSeleccionados.map(u => ({
          id_user: u.id_user,
          nombre: u.nombre,
          apellido: u.apellido,
          foto_perfil: u.foto_perfil
        })),
        ultimo_mensaje: null,
        mensajes_no_leidos: 0
      };
      
      setConversaciones([conversacionConParticipantes, ...conversaciones]);
      setShowNuevoMensaje(false);
      setBusquedaUsuarios('');
      setUsuariosEncontrados([]);
      setUsuariosSeleccionados([]);
      setNombreGrupo('');
      setTipoConversacion('individual');
      handleSelectConversacion(conversacionConParticipantes);
    } else {
      const errorMsg = typeof apiError === 'string' ? apiError : 
                      apiError?.message || 
                      JSON.stringify(apiError) || 
                      'Error al crear conversación';
      console.error('Error creando conversación:', apiError);
      alert(errorMsg);
    }
  };

  // Manejador para seleccionar una conversación
  const handleSelectConversacion = (conversacion) => {
    // Determinar participante para conversaciones privadas
    const otroParticipante = conversacion.es_grupal || conversacion.tipo === 'grupal' ? null : 
      (conversacion.participantes && conversacion.participantes.length > 0 ? conversacion.participantes[0] : null);
    
    const esGrupal = conversacion.es_grupal || conversacion.tipo === 'grupal';
    const nombreCompleto = otroParticipante ? 
      `${otroParticipante.nombre || ''} ${otroParticipante.apellido || ''}`.trim() : 'Usuario';
    
    onSelectItem({
      id_conversacion: conversacion.id_conversacion,
      es_grupal: esGrupal,
      tipo: 'conversacion',  // Siempre 'conversacion' para que DetailPanel lo maneje como chat
      tipo_conversacion: conversacion.tipo || (esGrupal ? 'grupal' : 'privada'),
      nombre_grupo: conversacion.nombre,
      participantes: conversacion.participantes || [],
      mensajes_no_leidos: conversacion.mensajes_no_leidos || 0,
      ultimo_mensaje_texto: conversacion.ultimo_mensaje?.contenido || '',
      ultimo_mensaje_fecha: conversacion.ultimo_mensaje?.fecha_envio || null,
      userHandle: esGrupal ? 'grupo' : otroParticipante?.nombre?.toLowerCase().replace(' ', ''),
      userName: esGrupal ? (conversacion.nombre || 'Grupo') : nombreCompleto,
      userAvatar: esGrupal ? 
        'https://ui-avatars.com/api/?name=Grupo&background=random' :
        otroParticipante?.foto_perfil || `https://ui-avatars.com/api/?name=${nombreCompleto}&background=random`,
      title: esGrupal ? (conversacion.nombre || 'Grupo') : `Chat con ${nombreCompleto}`,
      image: 'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Mensajería',
      price: conversacion.mensajes_no_leidos || 0,
      id: conversacion.id_conversacion,
      esGrupal: esGrupal
    });
  };

  return (
    <>
      <div className="collections-section">
        <div className="collections-header" style={{
          background: `linear-gradient(145deg, ${theme.colors.cardBackground}dd, ${theme.colors.cardBackground}ee)`,
          backdropFilter: 'blur(10px)',
          border: `2px solid ${theme.colors.primaryLight}40`,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: '20px'
          }}>
            💬 Mensajería
          </h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <input 
                type="text" 
                placeholder="Buscar conversaciones..." 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingLeft: '40px',
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.primaryLight}40`,
                  background: theme.colors.cardBackground,
                  color: theme.colors.text,
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px'
              }}>🔍</span>
            </div>
            <button 
              onClick={() => setShowNuevoMensaje(!showNuevoMensaje)}
              style={{
                padding: '12px 24px',
                background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ✉️ Nuevo Mensaje
            </button>
          </div>
        </div>
        
        {/* Modal para nuevo mensaje */}
        {showNuevoMensaje && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowNuevoMensaje(false)}
          >
            <div style={{
              background: theme.colors.cardBackground,
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              border: `2px solid ${theme.colors.primaryLight}40`
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.colors.text }}>
                  Nuevo Mensaje
                </h3>
                <button 
                  onClick={() => {
                    setShowNuevoMensaje(false);
                    setUsuariosSeleccionados([]);
                    setNombreGrupo('');
                    setBusquedaUsuarios('');
                    setUsuariosEncontrados([]);
                    setTipoConversacion('individual');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: theme.colors.textSecondary
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Selector de tipo de conversación */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <button
                  onClick={() => {
                    setTipoConversacion('individual');
                    setUsuariosSeleccionados([]);
                    setNombreGrupo('');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: tipoConversacion === 'individual' ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.primaryLight}40`,
                    background: tipoConversacion === 'individual' ? `${theme.colors.primary}20` : theme.colors.background,
                    color: theme.colors.text,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  👤 Individual
                </button>
                <button
                  onClick={() => {
                    setTipoConversacion('grupal');
                    setUsuariosSeleccionados([]);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: tipoConversacion === 'grupal' ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.primaryLight}40`,
                    background: tipoConversacion === 'grupal' ? `${theme.colors.primary}20` : theme.colors.background,
                    color: theme.colors.text,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  👥 Grupo
                </button>
              </div>

              {/* Nombre del grupo (solo para grupos) */}
              {tipoConversacion === 'grupal' && (
                <input 
                  type="text"
                  placeholder="Nombre del grupo..."
                  value={nombreGrupo}
                  onChange={(e) => setNombreGrupo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.primaryLight}40`,
                    background: theme.colors.background,
                    color: theme.colors.text,
                    fontSize: '15px',
                    marginBottom: '12px'
                  }}
                />
              )}

              {/* Usuarios seleccionados */}
              {usuariosSeleccionados.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: `${theme.colors.primary}10`,
                  border: `1px solid ${theme.colors.primaryLight}40`
                }}>
                  {usuariosSeleccionados.map(usuario => (
                    <div key={usuario.id_user} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {usuario.nombre} {usuario.apellido}
                      <button
                        onClick={() => toggleUsuarioSeleccionado(usuario)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: 0,
                          marginLeft: '4px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <input 
                type="text"
                placeholder="Buscar usuario..."
                value={busquedaUsuarios}
                onChange={(e) => {
                  setBusquedaUsuarios(e.target.value);
                  buscarUsuarios(e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.primaryLight}40`,
                  background: theme.colors.background,
                  color: theme.colors.text,
                  fontSize: '15px',
                  marginBottom: '16px'
                }}
              />
              
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {usuariosEncontrados.map(usuario => {
                  const yaSeleccionado = usuariosSeleccionados.find(u => u.id_user === usuario.id_user);
                  return (
                    <div 
                      key={usuario.id_user}
                      onClick={() => toggleUsuarioSeleccionado(usuario)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        background: yaSeleccionado ? `${theme.colors.primary}30` : 'transparent',
                        border: yaSeleccionado ? `2px solid ${theme.colors.primary}` : 'none'
                      }}
                      onMouseOver={(e) => !yaSeleccionado && (e.currentTarget.style.background = `${theme.colors.primary}20`)}
                      onMouseOut={(e) => !yaSeleccionado && (e.currentTarget.style.background = 'transparent')}
                    >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: usuario.foto_perfil ?
                        `url(${usuario.foto_perfil}) center/cover` :
                        `linear-gradient(135deg, ${theme.colors.primary}dd, ${theme.colors.primaryLight}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      boxShadow: `0 2px 6px ${theme.colors.primary}40`,
                      flexShrink: 0,
                      letterSpacing: '1px'
                    }}>
                      {!usuario.foto_perfil && (
                        `${usuario.nombre?.[0]?.toUpperCase() || ''}${usuario.apellido?.[0]?.toUpperCase() || ''}`
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: theme.colors.text }}>
                        {usuario.nombre} {usuario.apellido}
                      </div>
                      <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                        {usuario.correo}
                      </div>
                    </div>
                    {yaSeleccionado && (
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: theme.colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </div>
                    )}
                    </div>
                  );
                })}
                {busquedaUsuarios.length >= 2 && usuariosEncontrados.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: theme.colors.textSecondary
                  }}>
                    No se encontraron usuarios
                  </div>
                )}
              </div>

              {/* Botón para crear conversación */}
              {usuariosSeleccionados.length > 0 && (
                <button
                  onClick={crearNuevaConversacion}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '16px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {tipoConversacion === 'individual' ? '💬 Iniciar Chat' : '👥 Crear Grupo'} ({usuariosSeleccionados.length})
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="tab-selector">
          <div 
            className={`tab-item ${activeTab === 'recientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recientes')}
          >
            Recientes
          </div>
          <div 
            className={`tab-item ${activeTab === 'no-leidos' ? 'active' : ''}`}
            onClick={() => setActiveTab('no-leidos')}
          >
            No leídos
          </div>
          <div 
            className={`tab-item ${activeTab === 'grupos' ? 'active' : ''}`}
            onClick={() => setActiveTab('grupos')}
          >
            Grupos
          </div>
        </div>
        
        <div className="collections-grid message-grid">
          {loading ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px',
              fontSize: '16px',
              color: theme.colors.textSecondary
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⏳</div>
              <div>Cargando conversaciones...</div>
            </div>
          ) : error ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px'
            }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>❌</div>
              <div style={{ fontSize: '16px', color: theme.colors.notification, marginBottom: '20px' }}>
                {error}
              </div>
              <button
                onClick={loadConversaciones}
                style={{
                  padding: '12px 24px',
                  background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🔄 Reintentar
              </button>
            </div>
          ) : conversaciones.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px',
              fontSize: '16px',
              color: theme.colors.textSecondary
            }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>💬</div>
              <div>No tienes conversaciones</div>
              <button
                onClick={() => setShowNuevoMensaje(true)}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✉️ Iniciar conversación
              </button>
            </div>
          ) : (
            conversaciones
              .filter(conversacion => {
                if (activeTab === 'recientes') return true;
                if (activeTab === 'no-leidos') return (conversacion.mensajes_no_leidos || 0) > 0;
                if (activeTab === 'grupos') return conversacion.es_grupal || conversacion.tipo === 'grupal';
                return true;
              })
              .map((conversacion) => {
                const esGrupal = conversacion.es_grupal || conversacion.tipo === 'grupal';
                const otroParticipante = !esGrupal && conversacion.participantes?.length > 0 ? 
                  conversacion.participantes[0] : null;
                const nombreMostrar = esGrupal ? 
                  conversacion.nombre || 'Grupo' : 
                  (otroParticipante ? `${otroParticipante.nombre} ${otroParticipante.apellido}`.trim() : 'Usuario');
                
                return (
                  <div 
                    key={conversacion.id_conversacion} 
                    className="collection-card message-card" 
                    onClick={() => handleSelectConversacion(conversacion)}
                    style={{ 
                      width: '100%',
                      background: `linear-gradient(145deg, ${theme.colors.cardBackground}dd, ${theme.colors.cardBackground}ee)`,
                      backdropFilter: 'blur(10px)',
                      border: `2px solid ${theme.colors.primaryLight}40`,
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = theme.colors.primary;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = `${theme.colors.primaryLight}40`;
                    }}
                  >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      {esGrupal ? (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${theme.colors.primary}dd, ${theme.colors.primaryLight}dd)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          boxShadow: `0 2px 8px ${theme.colors.primary}40`,
                          flexShrink: 0
                        }}>
                          👥
                        </div>
                      ) : (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: otroParticipante?.foto_perfil ? 
                            `url(${otroParticipante.foto_perfil}) center/cover` :
                            `linear-gradient(135deg, ${theme.colors.primary}dd, ${theme.colors.primaryLight}dd)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '700',
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          boxShadow: `0 2px 8px ${theme.colors.primary}40`,
                          flexShrink: 0,
                          letterSpacing: '1px'
                        }}>
                          {!otroParticipante?.foto_perfil && (
                            `${otroParticipante?.nombre?.[0]?.toUpperCase() || ''}${otroParticipante?.apellido?.[0]?.toUpperCase() || ''}`
                          )}
                        </div>
                      )}
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '4px'
                        }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: theme.colors.text
                          }}>
                            {nombreMostrar}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: theme.colors.textSecondary
                          }}>
                            {conversacion.ultimo_mensaje?.fecha_envio ? 
                              new Date(conversacion.ultimo_mensaje.fecha_envio).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false
                              }) : 
                              ''
                            }
                          </div>
                        </div>
                        
                        <div style={{
                          fontSize: '14px',
                          color: theme.colors.textSecondary,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '8px'
                        }}>
                          {conversacion.ultimo_mensaje?.contenido || 'Sin mensajes'}
                        </div>
                        
                        {(conversacion.mensajes_no_leidos || 0) > 0 && (
                          <div style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: theme.colors.notification,
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {conversacion.mensajes_no_leidos}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
      
      {selectedItem && <DetailPanel item={selectedItem} onClose={() => onSelectItem(null)} />}
    </>
  );
};

export default MessagesModule;