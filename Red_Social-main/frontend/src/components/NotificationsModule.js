import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import amigosService from '../services/amigosService';
import carpoolingService from '../services/carpoolingService';
import DetailPanel from './DetailPanel';

const NotificationsModule = ({ onSelectItem, selectedItem }) => {
  const { theme } = useTheme();
  
  // Estado para notificaciones
  const [activeTab, setActiveTab] = useState('todas');
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [responseModal, setResponseModal] = useState({ show: false, type: '', message: '' });
  const [notificationSearch, setNotificationSearch] = useState('');

  // Cargar notificaciones al montar
  useEffect(() => {
    loadNotificaciones();
  }, []);

  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.notificaciones.getAll(0, 50);
      console.log('📬 Notificaciones cargadas:', response.data);
      
      // Filtrar notificaciones antiguas de carpooling sin referencia
      const notificacionesValidas = response.data.filter(n => {
        // Si es de carpooling, debe tener id_referencia
        if (n.tipo === 'solicitud_ruta') {
          const tieneReferencia = !!n.id_referencia;
          console.log('🚗 Notificación de ruta:', {
            contenido: n.contenido,
            id_referencia: n.id_referencia,
            tipo: n.tipo,
            valida: tieneReferencia
          });
          return tieneReferencia; // Solo incluir si tiene referencia
        }
        return true; // Incluir todas las demás notificaciones
      });
      
      console.log(`✅ Notificaciones válidas: ${notificacionesValidas.length} de ${response.data.length}`);
      setNotificaciones(notificacionesValidas || []);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      let errorMessage = 'Error al cargar notificaciones';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map(e => e.msg || JSON.stringify(e)).join(', ');
        } else {
          errorMessage = detail.msg || detail.message || JSON.stringify(detail);
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await apiService.notificaciones.marcarTodasLeidas();
      // Actualizar localmente
      setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
    } catch (err) {
      console.error('Error al marcar como leídas:', err);
      alert('Error al marcar notificaciones como leídas');
    }
  };

  const handleMarcarLeida = async (idNotificacion) => {
    try {
      await apiService.notificaciones.marcarLeida(idNotificacion);
      // Actualizar localmente
      setNotificaciones(notificaciones.map(n => 
        n.id_notificacion === idNotificacion ? { ...n, leida: true } : n
      ));
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };

  // Manejador para seleccionar una notificación
  const handleSelectNotificacion = async (notificacion) => {
    // Marcar como leída al abrir
    if (!notificacion.leida) {
      await handleMarcarLeida(notificacion.id_notificacion);
    }

    onSelectItem({
      ...notificacion,
      userHandle: 'notificacion',
      userName: 'Notificación del Sistema',
      userAvatar: 'https://ui-avatars.com/api/?name=Sistema&background=9333ea',
      title: notificacion.titulo || getTipoNotificacionText(notificacion.tipo),
      subtitle: notificacion.mensaje || notificacion.contenido || '',
      image: 'https://via.placeholder.com/400x300/9333ea/FFFFFF?text=Notificación',
      id: notificacion.id_notificacion,
      price: new Date(notificacion.fecha_envio).toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      }),
      tipo: 'notificacion'
    });
  };

  const getTipoNotificacionText = (tipo) => {
    const tipos = {
      'comentario': '💬 Comentario',
      'reaccion': '❤️ Reacción',
      'solicitud_amistad': '👥 Solicitud de Amistad',
      'amistad_aceptada': '✅ Amistad Aceptada',
      'solicitud_ruta': '🚗 Solicitud de Ruta',
      'mensaje': '✉️ Mensaje',
      'nota_nueva': '📝 Nueva Nota',
      'otro': '🔔 Notificación'
    };
    return tipos[tipo] || '🔔 Notificación';
  };

  const getIconoTipo = (tipo) => {
    const iconos = {
      'comentario': '💬',
      'reaccion': '❤️',
      'solicitud_amistad': '👥',
      'amistad_aceptada': '✅',
      'solicitud_ruta': '🚗',
      'mensaje': '✉️',
      'nota_nueva': '📝',
      'otro': '🔔'
    };
    return iconos[tipo] || '🔔';
  };

  const handleResponderSolicitud = async (notificacion, accion) => {
    try {
      setProcessingRequest(notificacion.id_notificacion);
      const idRelacion = notificacion.id_referencia;
      
      await amigosService.responderSolicitud(idRelacion, accion);
      
      // Marcar notificación como leída
      await apiService.notificaciones.markAsRead(notificacion.id_notificacion);
      
      // Recargar notificaciones
      await loadNotificaciones();
      
      setResponseModal({
        show: true,
        type: 'success',
        message: accion === 'aceptar' 
          ? '¡Solicitud de amistad aceptada!' 
          : 'Solicitud de amistad rechazada'
      });
    } catch (err) {
      console.error('Error al responder solicitud:', err);
      setResponseModal({
        show: true,
        type: 'error',
        message: 'Error al procesar la solicitud de amistad'
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleResponderSolicitudRuta = async (notificacion, accion) => {
    try {
      setProcessingRequest(notificacion.id_notificacion);
      let idPasajero = notificacion.id_referencia;
      
      console.log('🚗 Respondiendo solicitud de ruta:', { idPasajero, accion, notificacion });
      
      // Si no hay id_referencia, intentar extraer info del contenido y buscar en la BD
      if (!idPasajero) {
        setResponseModal({
          show: true,
          type: 'error',
          message: 'Esta es una notificación antigua sin referencia. Por favor, pide al usuario que vuelva a solicitar unirse a tu ruta.'
        });
        setProcessingRequest(null);
        return;
      }
      
      if (accion === 'aceptar') {
        await carpoolingService.aceptarPasajero(idPasajero);
      } else {
        await carpoolingService.rechazarPasajero(idPasajero);
      }
      
      // Marcar notificación como leída
      await apiService.notificaciones.marcarLeida(notificacion.id_notificacion);
      
      // Recargar notificaciones
      await loadNotificaciones();
      
      // Disparar evento para que el módulo de carpooling se actualice
      window.dispatchEvent(new CustomEvent('carpooling-updated'));
      
      setResponseModal({
        show: true,
        type: 'success',
        message: accion === 'aceptar' 
          ? '¡Pasajero aceptado! Se ha unido a tu ruta.' 
          : 'Solicitud de ruta rechazada'
      });
    } catch (err) {
      console.error('Error al responder solicitud de ruta:', err);
      console.error('Detalles del error:', err.response?.data);
      setResponseModal({
        show: true,
        type: 'error',
        message: err.message || 'Error al procesar la solicitud de ruta'
      });
    } finally {
      setProcessingRequest(null);
    }
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
            🔔 Notificaciones
          </h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <input 
                type="text" 
                placeholder="Buscar notificaciones..." 
                value={notificationSearch}
                onChange={(e) => setNotificationSearch(e.target.value)}
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
              onClick={handleMarcarTodasLeidas}
              style={{
                padding: '12px 24px',
                background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ✓ Marcar todas como leídas
            </button>
          </div>
        </div>
        
        <div className="tab-selector" style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          background: `${theme.colors.cardBackground}dd`,
          padding: '8px',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.primaryLight}20`
        }}>
          <div 
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              background: activeTab === 'todas' ? `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})` : 'transparent',
              color: activeTab === 'todas' ? 'white' : theme.colors.textSecondary
            }}
            onClick={() => setActiveTab('todas')}
          >
            Todas
          </div>
          <div 
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              background: activeTab === 'no-leidas' ? `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})` : 'transparent',
              color: activeTab === 'no-leidas' ? 'white' : theme.colors.textSecondary
            }}
            onClick={() => setActiveTab('no-leidas')}
          >
            No leídas {notificaciones.filter(n => !n.leida).length > 0 && `(${notificaciones.filter(n => !n.leida).length})`}
          </div>
        </div>
        
        <div className="collections-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '16px'
        }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
              <div>Cargando notificaciones...</div>
            </div>
          ) : error ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>❌</div>
              <div>{error}</div>
              <button 
                onClick={loadNotificaciones}
                style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
              >
                Reintentar
              </button>
            </div>
          ) : notificaciones.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '60px', marginBottom: '16px' }}>🔔</div>
              <div>No tienes notificaciones</div>
            </div>
          ) : (
            notificaciones
            .filter(notif => {
              // filtro por pestaña
              if (activeTab === 'no-leidas' && notif.leida) return false;

              // filtro por búsqueda de notificaciones
              const q = (notificationSearch || '').trim().toLowerCase();
              if (!q) return true;

              const titulo = (notif.titulo || '').toLowerCase();
              const mensaje = (notif.mensaje || notif.contenido || '').toLowerCase();
              const remitente = ((notif.remitente && (notif.remitente.nombre || notif.remitente.usuario)) || '').toString().toLowerCase();

              if (titulo.includes(q) || mensaje.includes(q) || remitente.includes(q)) return true;
              return false;
            })
            .map((notificacion) => (
              <div 
                key={notificacion.id_notificacion} 
                onClick={() => handleSelectNotificacion(notificacion)}
                style={{ 
                  width: '100%',
                  background: !notificacion.leida 
                    ? `linear-gradient(145deg, ${theme.colors.primary}40, ${theme.colors.primaryLight}30)`
                    : `linear-gradient(145deg, ${theme.colors.cardBackground}dd, ${theme.colors.cardBackground}ee)`,
                  border: `2px solid ${!notificacion.leida ? theme.colors.primaryLight : theme.colors.primaryLight + '30'}`,
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'visible',
                  minHeight: (notificacion.tipo === 'solicitud_ruta' || notificacion.tipo === 'solicitud_amistad') ? '220px' : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${theme.colors.primary}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {!notificacion.leida && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: theme.colors.primary,
                    boxShadow: `0 0 8px ${theme.colors.primary}`
                  }} />
                )}
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '32px',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${theme.colors.primary}20`,
                    borderRadius: '12px'
                  }}>
                    {getIconoTipo(notificacion.tipo)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: theme.colors.textSecondary,
                      marginBottom: '4px'
                    }}>
                      {new Date(notificacion.fecha_envio).toLocaleString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div style={{ 
                      fontSize: '15px',
                      lineHeight: '1.5',
                      color: theme.colors.text,
                      fontWeight: !notificacion.leida ? '600' : '400'
                    }}>
                      <strong>{notificacion.titulo || getTipoNotificacionText(notificacion.tipo)}</strong>
                      <br />
                      {notificacion.mensaje || notificacion.contenido || ''}
                    </div>

                    {/* Botones para solicitudes de amistad */}
                    {notificacion.tipo === 'solicitud_amistad' && notificacion.id_referencia && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: `1px solid ${theme.colors.primaryLight}20`
                      }}
                      onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleResponderSolicitud(notificacion, 'aceptar')}
                          disabled={processingRequest === notificacion.id_notificacion}
                          style={{
                            flex: 1,
                            padding: '8px 16px',
                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: processingRequest === notificacion.id_notificacion ? 'wait' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: processingRequest === notificacion.id_notificacion ? 0.6 : 1,
                            boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)'
                          }}
                          onMouseOver={(e) => {
                            if (processingRequest !== notificacion.id_notificacion) {
                              e.target.style.transform = 'translateY(-1px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.4)';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (processingRequest !== notificacion.id_notificacion) {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(147, 51, 234, 0.3)';
                            }
                          }}
                        >
                          {processingRequest === notificacion.id_notificacion ? '⏳ Procesando...' : '✓ Aceptar'}
                        </button>
                        <button
                          onClick={() => handleResponderSolicitud(notificacion, 'rechazar')}
                          disabled={processingRequest === notificacion.id_notificacion}
                          style={{
                            flex: 1,
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: theme.colors.textSecondary,
                            border: `1.5px solid ${theme.colors.primaryLight}30`,
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: processingRequest === notificacion.id_notificacion ? 'wait' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: processingRequest === notificacion.id_notificacion ? 0.6 : 1
                          }}
                          onMouseOver={(e) => {
                            if (processingRequest !== notificacion.id_notificacion) {
                              e.target.style.backgroundColor = theme.colors.primaryLight + '15';
                              e.target.style.borderColor = theme.colors.primaryLight + '50';
                              e.target.style.color = theme.colors.text;
                            }
                          }}
                          onMouseOut={(e) => {
                            if (processingRequest !== notificacion.id_notificacion) {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.borderColor = theme.colors.primaryLight + '30';
                              e.target.style.color = theme.colors.textSecondary;
                            }
                          }}
                        >
                          {processingRequest === notificacion.id_notificacion ? '⏳ Procesando...' : 'Rechazar'}
                        </button>
                      </div>
                    )}

                    {/* Botones para solicitudes de ruta (carpooling) */}
                    {notificacion.tipo === 'solicitud_ruta' && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: `1px solid ${theme.colors.primaryLight}20`
                      }}
                      onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleResponderSolicitudRuta(notificacion, 'aceptar')}
                          disabled={processingRequest === notificacion.id_notificacion}
                          style={{
                            flex: 1,
                            padding: '8px 16px',
                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: processingRequest === notificacion.id_notificacion ? 'wait' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: processingRequest === notificacion.id_notificacion ? 0.6 : 1,
                            boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)'
                          }}
                          onMouseOver={(e) => {
                            if (processingRequest !== notificacion.id_notificacion) {
                              e.target.style.transform = 'translateY(-1px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.4)';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (processingRequest !== notificacion.id_notificacion) {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(147, 51, 234, 0.3)';
                            }
                          }}
                        >
                          {processingRequest === notificacion.id_notificacion ? '⏳ Procesando...' : '🚗 Aceptar'}
                        </button>
                        <button
                          onClick={() => handleResponderSolicitudRuta(notificacion, 'rechazar')}
                          disabled={processingRequest === notificacion.id_notificacion}
                          style={{
                            flex: 1,
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: theme.colors.textSecondary,
                            border: `1.5px solid ${theme.colors.primaryLight}30`,
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: processingRequest === notificacion.id_notificacion ? 'wait' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: processingRequest === notificacion.id_notificacion ? 0.6 : 1
                          }}
                          onMouseOver={(e) => {
                            if (processingRequest !== notificacion.id_notificacion) {
                              e.target.style.backgroundColor = theme.colors.primaryLight + '15';
                              e.target.style.borderColor = theme.colors.primaryLight + '50';
                              e.target.style.color = theme.colors.text;
                            }
                          }}
                          onMouseOut={(e) => {
                            if (processingRequest !== notificacion.id_notificacion) {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.borderColor = theme.colors.primaryLight + '30';
                              e.target.style.color = theme.colors.textSecondary;
                            }
                          }}
                        >
                          {processingRequest === notificacion.id_notificacion ? '⏳ Procesando...' : 'Rechazar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {selectedItem && <DetailPanel item={selectedItem} onClose={() => onSelectItem(null)} />}

      {/* Modal de respuesta */}
      {responseModal.show && (
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
            backgroundColor: theme.colors.cardBackground,
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            <div style={{
              fontSize: '48px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              {responseModal.type === 'success' ? '✅' : '❌'}
            </div>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '24px',
              color: theme.colors.text,
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {responseModal.type === 'success' ? '¡Éxito!' : 'Error'}
            </h3>
            <p style={{
              margin: '0 0 25px 0',
              fontSize: '16px',
              color: theme.colors.textSecondary,
              lineHeight: '1.5',
              textAlign: 'center'
            }}>
              {responseModal.message}
            </p>
            <button
              onClick={() => setResponseModal({ show: false, type: '', message: '' })}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: responseModal.type === 'success' ? theme.colors.primary : '#dc3545',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsModule;