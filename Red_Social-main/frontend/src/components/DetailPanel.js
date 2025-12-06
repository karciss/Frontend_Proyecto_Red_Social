import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { publicacionesService } from '../services/publicacionesService';
import mensajeriaService from '../services/mensajeriaService';
import '../styles/DetailPanel.css';
import '../styles/CarpoolingDetail.css';
import '../styles/Messages.css';

const DetailPanel = ({ item, onClose, onUpdateComentarios }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [showAllComments, setShowAllComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [loadingMensajes, setLoadingMensajes] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [conversacionInfo, setConversacionInfo] = useState(null);
  const [loadingGroupInfo, setLoadingGroupInfo] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Default item para mostrar siempre un ejemplo como en la imagen
  const defaultItem = {
    id: '141',
    title: 'Red Social Universitaria',
    userName: 'Bienvenido',
    userHandle: 'bienvenido',
    price: '0',
    tipo: 'default',
    image: 'https://via.placeholder.com/300x400/333/fff?text=Bienvenido'
  };
  
  // Usar el item seleccionado o el default
  item = item || defaultItem;

  // Inicializar comentarios locales cuando cambie el item
  React.useEffect(() => {
    setLocalComments(item.comentarios || []);
  }, [item]);

  // Cargar mensajes cuando se abre una conversación
  useEffect(() => {
    if (item.tipo === 'conversacion' && item.id_conversacion) {
      loadMensajes();
    }
  }, [item.id_conversacion]);

  // Scroll automático al final cuando cambian los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMensajes = async () => {
    setLoadingMensajes(true);
    const { data, error } = await mensajeriaService.getMensajesConversacion(item.id_conversacion);
    if (!error && data) {
      setMensajes(data);
    }
    setLoadingMensajes(false);
  };

  const loadGroupInfo = async () => {
    if (!item.id_conversacion) return;
    
    setLoadingGroupInfo(true);
    const { data, error } = await mensajeriaService.getConversacionInfo(item.id_conversacion);
    if (!error && data) {
      setConversacionInfo(data);
    }
    setLoadingGroupInfo(false);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const mensajeData = {
      id_conversacion: item.id_conversacion,
      contenido: messageText
    };

    const { data, error } = await mensajeriaService.enviarMensaje(mensajeData);
    
    if (!error && data) {
      setMensajes([...mensajes, data]);
      setMessageText('');
      // Scroll al final después de enviar
      setTimeout(scrollToBottom, 100);
    } else {
      alert(error || 'Error al enviar mensaje');
    }
  };

  // Función para enviar comentario al backend
  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    if (!item.id_publicacion) {
      // Si no es una publicación, usar comportamiento local
      const comment = {
        id_comentario: `c-${Date.now()}`,
        usuario: {
          nombre: user?.nombre || 'Tú',
          apellido: user?.apellido || '',
          foto_perfil: user?.foto_perfil || `https://ui-avatars.com/api/?name=${user?.nombre || 'U'}&background=random`
        },
        contenido: newComment,
        fecha_creacion: new Date().toISOString()
      };
      setLocalComments(prev => [comment, ...prev]);
      setNewComment('');
      return;
    }

    try {
      setSendingComment(true);
      const { data, error } = await publicacionesService.comentar(item.id_publicacion, newComment);
      
      if (error) {
        console.error('Error detallado:', error);
        setErrorText(typeof error === 'string' ? error : 'Error al comentar');
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 4000);
      } else {
        // Si el backend no devolvió info del usuario, agregarla manualmente (temporal)
        if (!data.usuario && user) {
          data.usuario = {
            nombre: user.nombre,
            apellido: user.apellido,
            foto_perfil: user.foto_perfil
          };
        }
        
        // Agregar el comentario nuevo al inicio
        setLocalComments(prev => [data, ...prev]);
        setNewComment('');
        
        // Actualizar el contador en la lista de publicaciones
        if (onUpdateComentarios) {
          onUpdateComentarios(item.id_publicacion);
        }
        
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
      }
    } catch (err) {
      console.error('Error al enviar comentario:', err);
      setErrorText('Error inesperado al comentar');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 4000);
    } finally {
      setSendingComment(false);
    }
  };

  // Función para reaccionar a una publicación
  const handleReaction = async (tipo = 'like') => {
    if (!item.id_publicacion) return;

    try {
      const { data, error } = await publicacionesService.reaccionar(item.id_publicacion, tipo);
      
      if (error) {
        alert(`Error al reaccionar: ${error}`);
      } else {
        // TODO: Actualizar contador de reacciones localmente
        console.log('Reacción agregada:', data);
      }
    } catch (err) {
      console.error('Error al reaccionar:', err);
    }
  };
  
  // Renderizar diferentes tipos de detalle según el tipo de elemento
  const renderDetailContent = () => {
    switch (item.tipo) {
      case 'materia':
        return renderMateriaDetail();
      case 'carpooling':
        return renderCarpoolingDetail();
      case 'conversacion':
        return renderConversacionDetail();
      case 'notificacion':
        return renderNotificacionDetail();
      default:
        return renderDefaultDetail();
    }
  };
  
  // Detalle de materia (académico)
  const renderMateriaDetail = () => (
    <>
      <div className="detail-content">
        <div className="item-image course-image">
          <img src={item.image} alt={item.title} />
          <div className="course-code-overlay">{item.id}</div>
        </div>
        
        <div className="item-info">
          <div className="item-title">{item.title}</div>
          <div className="teacher-info">
            <span>Docente:</span> {item.userName}
          </div>
          
          <div className="course-schedules">
            <h4>Horarios</h4>
            {item.horarios && item.horarios.map((horario, idx) => (
              <div key={idx} className="schedule-item-detail">
                <span className="day-label">{horario.dia}:</span> 
                <span>{horario.inicio} - {horario.fin}</span>
                <span className="classroom">{horario.aula}</span>
              </div>
            ))}
          </div>
          
          <div className="item-price-container">
            <div className="item-stats">Promedio:</div>
            <div className="item-price grade-display" style={{ background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})` }}>
              {item.price}
            </div>
          </div>
        </div>
      </div>
      
      {item.notas && (
        <div className="history-section">
          <div className="history-tabs">
            <div className="history-tab active">Calificaciones</div>
          </div>
          
          <table className="history-table">
            <thead>
              <tr>
                <th>Evaluación</th>
                <th>Nota</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {item.notas.map((nota, index) => (
                <tr key={index}>
                  <td>{nota.tipo_nota}</td>
                  <td>{nota.nota}</td>
                  <td>{new Date(nota.fecha).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
  
  // Detalle de ruta de carpooling
  const renderCarpoolingDetail = () => (
    <div className="detail-content">
      {/* Header con imagen de mapa */}
      <div className="item-image map-preview" style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
      }}>
        <img src={item.image} alt="Mapa de la ruta" style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover'
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          padding: '20px 16px 12px',
          color: 'white'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
            {item.title}
          </div>
        </div>
      </div>
      
      {/* Información principal de la ruta */}
      <div className="item-info">
        {/* Hora y días en cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 30, 65, 0.2), rgba(139, 30, 65, 0.1))',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(139, 30, 65, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ fontSize: '24px' }}>⏰</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>
              Hora de salida
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>
              {item.hora_salida || '00:00:00'}
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 30, 65, 0.2), rgba(139, 30, 65, 0.1))',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(139, 30, 65, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ fontSize: '24px' }}>📅</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>
              Días disponibles
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
              {item.dias_disponibles || 'No especificado'}
            </div>
          </div>
        </div>
        
        {/* Sección de paradas mejorada */}
        {item.paradas && item.paradas.length > 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>📍</span>
              <h4 style={{ 
                fontSize: '15px', 
                fontWeight: '600',
                margin: 0,
                color: 'white'
              }}>
                Paradas de la ruta
              </h4>
            </div>
            <div className="paradas-list">
              {item.paradas.map((parada, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                  borderRadius: '8px',
                  marginBottom: '6px'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8B1E41, #B23556)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700',
                    marginRight: '12px',
                    flexShrink: 0
                  }}>
                    {parada.orden || idx + 1}
                  </div>
                  <span style={{ 
                    fontSize: '14px', 
                    color: 'rgba(255,255,255,0.9)',
                    flex: 1
                  }}>
                    {parada.ubicacion}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)'
          }}>
            📍 Sin paradas intermedias
          </div>
        )}
        
        {/* Capacidad mejorada */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 30, 65, 0.3), rgba(139, 30, 65, 0.15))',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(139, 30, 65, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
              Capacidad total
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
              👥 Pasajeros disponibles
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #8B1E41, #B23556)',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '24px',
            fontWeight: '700',
            color: 'white',
            boxShadow: '0 4px 12px rgba(139, 30, 65, 0.4)'
          }}>
            {item.price}
          </div>
        </div>
      </div>
      
      {/* Sección de pasajeros mejorada */}
      <div className="passengers-section" style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <span style={{ fontSize: '20px' }}>👥</span>
          <h4 style={{ 
            fontSize: '15px', 
            fontWeight: '600',
            margin: 0,
            color: 'white'
          }}>
            Pasajeros ({parseInt(item.price.split('/')[0])})
          </h4>
        </div>
        
        <div className="passengers-list">
          {parseInt(item.price.split('/')[0]) > 0 ? (
            [...Array(parseInt(item.price.split('/')[0]))].map((_, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '10px',
                marginBottom: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginRight: '12px',
                  border: '2px solid rgba(139, 30, 65, 0.3)',
                  flexShrink: 0
                }}>
                  <img 
                    src={`https://ui-avatars.com/api/?name=Pasajero+${idx+1}&background=8B1E41&color=fff`} 
                    alt="Pasajero" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: 'white',
                    marginBottom: '2px'
                  }}>
                    Pasajero {idx + 1}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'rgba(255,255,255,0.5)'
                  }}>
                    Confirmado
                  </div>
                </div>
                <div style={{
                  padding: '4px 10px',
                  background: 'rgba(76, 175, 80, 0.2)',
                  border: '1px solid rgba(76, 175, 80, 0.4)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#4CAF50'
                }}>
                  ✓
                </div>
              </div>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '14px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>🚗</div>
              No hay pasajeros aún
            </div>
          )}
        </div>
      </div>
      
      {/* Botón de editar (solo si es mi ruta) */}
      {item.esMiRuta && (
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={() => {
              // Función de editar ruta
              console.log('Editar ruta:', item.id_ruta);
            }}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            <span style={{ fontSize: '18px' }}>✏️</span>
            Editar Ruta
          </button>
        </div>
      )}
    </div>
  );
  
  // Detalle de conversación de mensajería
  // Array de emojis disponibles para el selector
  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
    "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖",
    "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯",
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "❣️", "💕", "💞"
  ];

  const addEmoji = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const renderConversacionDetail = () => {
    const isGroupChat = item.esGrupal === true || (item.participantes && item.participantes.length > 2);
    
    // Agrupar mensajes por fecha
    const groupMessagesByDate = (messages) => {
      const groups = {};
      messages.forEach(mensaje => {
        const fecha = new Date(mensaje.fecha_envio);
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        
        let label;
        if (fecha.toDateString() === hoy.toDateString()) {
          label = 'Hoy';
        } else if (fecha.toDateString() === ayer.toDateString()) {
          label = 'Ayer';
        } else {
          label = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
        }
        
        if (!groups[label]) {
          groups[label] = [];
        }
        groups[label].push(mensaje);
      });
      return groups;
    };

    const mensajesAgrupados = groupMessagesByDate(mensajes);
    
    return (
      <>
        <div className="detail-content">
          <div className="messages-container">
            {loadingMensajes ? (
              <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.textSecondary }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
                <div>Cargando mensajes...</div>
              </div>
            ) : mensajes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.textSecondary }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>💬</div>
                <div>No hay mensajes aún</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>Envía el primer mensaje</div>
              </div>
            ) : (
              Object.keys(mensajesAgrupados).map(fecha => (
                <div key={fecha}>
                  <div className="message-day-divider">{fecha}</div>
                  {mensajesAgrupados[fecha].map(mensaje => {
                    const esMio = mensaje.id_user === user?.id_user;
                    // Asegurarse de que la fecha se parsea correctamente
                    const fechaMensaje = new Date(mensaje.fecha_envio);
                    const hora = fechaMensaje.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false
                    });
                    
                    return (
                      <div key={mensaje.id_mensaje} className={`message-bubble ${esMio ? 'sent' : 'received'}`}>
                        {mensaje.usuario && (
                          <div className="message-sender" style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            marginBottom: '4px',
                            color: esMio ? 'rgba(255,255,255,0.8)' : theme.colors.primary,
                            textAlign: esMio ? 'right' : 'left'
                          }}>
                            {esMio ? 'Tú' : `${mensaje.usuario.nombre} ${mensaje.usuario.apellido}`}
                          </div>
                        )}
                        <div className="message-text">{mensaje.contenido}</div>
                        <div className="message-time">{hora}</div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="message-input-area">
          <button 
            className="emoji-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </button>
          <input 
            type="text" 
            placeholder="Escribe un mensaje..." 
            className="message-input"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button 
            className="send-message-btn"
            style={{ backgroundColor: theme.colors.primary }}
            onClick={handleSendMessage}
          >
            📤
          </button>
  
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <div className="emoji-grid">
                {emojis.map((emoji, idx) => (
                  <div 
                    key={idx} 
                    className="emoji-item" 
                    onClick={() => {
                      setMessageText(messageText + emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };
  // Detalle de notificación
  const renderNotificacionDetail = () => (
    <>
      <div className="detail-content notification-detail">
        <div className="notification-icon" style={{ backgroundColor: theme.colors.primaryLight }}>
          {item.tipo === 'comentario' && '💬'}
          {item.tipo === 'reaccion' && '❤️'}
          {item.tipo === 'solicitud_amistad' && '👥'}
          {item.tipo === 'solicitud_ruta' && '🚗'}
          {item.tipo === 'mensaje' && '✉️'}
          {item.tipo === 'nota_nueva' && '📝'}
          {item.tipo === 'otro' && '🔔'}
        </div>
        
        <div className="item-info">
          <div className="item-title notification-title">{item.contenido}</div>
          <div className="notification-date">
            {new Date(item.fecha_envio).toLocaleString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
          
          {item.referencia && item.referencia.fragmento && (
            <div className="notification-reference-full">
              <p>"{item.referencia.fragmento}"</p>
            </div>
          )}
          
          <div className="notification-actions">
            {(item.tipo === 'solicitud_amistad' || item.tipo === 'solicitud_ruta') && (
              <>
                <button className="notification-action accept" style={{ backgroundColor: theme.colors.success }}>
                  Aceptar
                </button>
                <button className="notification-action reject" style={{ backgroundColor: theme.colors.notification }}>
                  Rechazar
                </button>
              </>
            )}
            
            {item.tipo === 'comentario' && (
              <button className="notification-action" style={{ backgroundColor: theme.colors.info }}>
                Ver comentario
              </button>
            )}
            
            {item.tipo === 'reaccion' && (
              <button className="notification-action" style={{ backgroundColor: theme.colors.info }}>
                Ver publicación
              </button>
            )}
            
            {item.tipo === 'mensaje' && (
              <button className="notification-action" style={{ backgroundColor: theme.colors.info }}>
                Responder
              </button>
            )}
            
            {item.tipo === 'nota_nueva' && (
              <button className="notification-action" style={{ backgroundColor: theme.colors.info }}>
                Ver calificación
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
  
  // Detalle por defecto
  const renderDefaultDetail = () => (
    <>
      <div className="detail-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Información del usuario y contenido */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          padding: '20px',
          background: `${theme.colors.cardBackground}dd`,
          borderRadius: '16px',
          border: `1px solid ${theme.colors.primaryLight}20`
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: item.userAvatar ? `url(${item.userAvatar}) center/cover` : `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            flexShrink: 0
          }}>
            {!item.userAvatar && (item.userName?.[0]?.toUpperCase() || '👤')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: '4px'
            }}>
              {item.userName || 'Usuario'}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: theme.colors.textSecondary,
              marginBottom: '16px'
            }}>
              @{item.userHandle || 'usuario'}
            </div>
            <div style={{ 
              fontSize: '16px',
              lineHeight: '1.6',
              color: theme.colors.text,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {item.contenido || item.title}
            </div>
          </div>
        </div>

        {/* Mostrar media si existe */}
        {item.media && item.media.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%'
          }}>
            {item.media.map((media, idx) => (
              <div key={idx} style={{
                width: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                border: `1px solid ${theme.colors.primaryLight}20`
              }}>
                {(media.tipo === 'imagen' || media.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                  <img 
                    src={media.url} 
                    alt={`Media ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'contain',
                      maxHeight: 'none',
                      background: '#000'
                    }}
                  />
                )}
                {media.tipo === 'video' && (
                  <video 
                    src={media.url} 
                    controls
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      maxHeight: '600px',
                      background: '#000'
                    }}
                  />
                )}
                {media.tipo === 'documento' && (
                  <div style={{
                    padding: '40px',
                    background: `linear-gradient(145deg, ${theme.colors.cardBackground}, ${theme.colors.cardBackground}dd)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: `linear-gradient(145deg, ${theme.colors.primary}40, ${theme.colors.primaryLight}40)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px'
                    }}>
                      📄
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: '700', 
                        color: theme.colors.text,
                        marginBottom: '8px' 
                      }}>
                        Documento adjunto
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: theme.colors.textSecondary 
                      }}>
                        Haz clic para abrir en una nueva pestaña
                      </div>
                    </div>
                    <a 
                      href={media.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        padding: '14px 32px',
                        background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                        color: 'white',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '16px',
                        transition: 'transform 0.2s ease',
                        display: 'inline-block'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      📂 Abrir documento
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Mostrar imagen legacy si no hay media pero sí image */}
        {(!item.media || item.media.length === 0) && item.image && (
          <div style={{
            width: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1px solid ${theme.colors.primaryLight}20`
          }}>
            <img 
              src={item.image} 
              alt={item.title} 
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        
        {/* Información adicional */}
        <div style={{
          padding: '20px',
          background: `${theme.colors.cardBackground}dd`,
          borderRadius: '16px',
          border: `1px solid ${theme.colors.primaryLight}20`
        }}>
          {item.url && (
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{
                color: theme.colors.primary,
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              🔗 {item.url}
            </a>
          )}
          
          {/* Stats: likes y reacciones */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            paddingTop: item.url ? '16px' : '0',
            borderTop: item.url ? `1px solid ${theme.colors.primaryLight}20` : 'none'
          }}>
            {item.reacciones !== undefined && (
              <div 
                onClick={() => handleReaction('like')}
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: `${theme.colors.primary}15`,
                  transition: 'all 0.2s ease',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = `${theme.colors.primary}30`;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = `${theme.colors.primary}15`;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Me gusta"
              >
                <span style={{ fontSize: '20px' }}>❤️</span>
                <span style={{ color: theme.colors.text }}>{item.price || item.reacciones || 0}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '15px',
              color: theme.colors.textSecondary
            }}>
              <span style={{ fontSize: '20px' }}>💬</span>
              <span>{localComments.length}</span>
            </div>
          </div>
        </div>
      </div>
      
      { (localComments && localComments.length >= 0) && item.tipo !== 'conversacion' && (
        <div className="history-section">
          <div className="comments-divider"></div>
          <div className="history-tabs">
            <div className="history-tab active">Comentarios ({localComments.length})</div>
          </div>
          
          <div className="comments-list">
            {(showAllComments ? localComments : localComments.slice(0, 3)).map((comment, idx) => (
              <div key={comment.id_comentario || idx} className="comment-item">
                <div className="comment-avatar">
                  <img 
                    src={comment.usuario?.foto_perfil || `https://ui-avatars.com/api/?name=${comment.usuario?.nombre || 'U'}&background=random`} 
                    alt={comment.usuario?.nombre || 'Usuario'} 
                  />
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.usuario?.nombre || 'Usuario'} {comment.usuario?.apellido || ''}
                    </span>
                    <span className="comment-date">
                      {new Date(comment.fecha_creacion).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="comment-text">{comment.contenido}</div>
                </div>
              </div>
            ))}
            {!showAllComments && localComments.length > 3 && (
              <div className="view-more-comments" onClick={() => setShowAllComments(true)}>
                Ver todos los {localComments.length} comentarios
              </div>
            )}
            {showAllComments && localComments.length > 3 && (
              <div className="view-more-comments" onClick={() => setShowAllComments(false)}>
                Mostrar menos
              </div>
            )}
          </div>
          {/* Input para añadir comentario en detalle */}
          <div className="add-comment-section">
            <div className="comment-input-container">
              <input 
                type="text" 
                className="comment-input" 
                placeholder="Escribe un comentario..." 
                value={newComment} 
                onChange={e => setNewComment(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !sendingComment) {
                    handleSendComment();
                  }
                }}
                disabled={sendingComment}
              />
              <button 
                className="comment-submit-btn" 
                onClick={handleSendComment}
                disabled={!newComment.trim() || sendingComment}
                style={{ 
                  background: (newComment.trim() && !sendingComment) 
                    ? `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})` 
                    : 'rgba(255,255,255,0.1)' 
                }}
              >
                {sendingComment ? 'Enviando...' : 'Comentar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
  
  return (
    <div className="detail-panel">
      {/* Mensaje de éxito flotante */}
      {showSuccessMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(145deg, #10b981, #34d399)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 10000,
          animation: 'slideDown 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          ¡Comentario enviado!
        </div>
      )}
      
      {/* Mensaje de error flotante */}
      {showErrorMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(145deg, #ef4444, #f87171)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 10000,
          animation: 'slideDown 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <span style={{ fontSize: '20px' }}>❌</span>
          {errorText}
        </div>
      )}
      
      <div className="detail-header">
        <div className="user-detail">
          <div className="user-detail-name">{item.userName}</div>
          {item.tipo === 'conversacion' && item.esGrupal ? (
            <div className="user-detail-username">@grupo</div>
          ) : (
            <div className="user-detail-username">@{item.userHandle}</div>
          )}
        </div>
        <div className="detail-actions">
          {item.tipo === 'materia' && <div className="action-button" title="Descargar material">📥</div>}
          {item.tipo === 'carpooling' && <div className="action-button" title="Compartir ruta">🔗</div>}
          {item.tipo === 'conversacion' && item.esGrupal && (
            <div 
              className="action-button" 
              title="Ver información del grupo"
              onClick={() => {
                setShowGroupInfo(true);
                if (!conversacionInfo) loadGroupInfo();
              }}
              style={{ cursor: 'pointer' }}
            >
              ℹ️
            </div>
          )}
          <div className="action-button" title="Favoritos">⭐</div>
          {onClose && (
            <button className="detail-close-btn" onClick={onClose} title="Cerrar">
              ✕
            </button>
          )}
        </div>
      </div>
      
      {renderDetailContent()}

      {/* Modal de información del grupo */}
      {showGroupInfo && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(5px)'
          }}
          onClick={() => setShowGroupInfo(false)}
        >
          <div 
            style={{
              background: theme.colors.cardBackground,
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: `2px solid ${theme.colors.primaryLight}`,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `2px solid ${theme.colors.primaryLight}40`
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: theme.colors.text,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '32px' }}>👥</span>
                Información del Grupo
              </div>
              <button
                onClick={() => setShowGroupInfo(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: theme.colors.textSecondary,
                  padding: '4px 8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = theme.colors.primaryLight + '30';
                  e.currentTarget.style.color = theme.colors.text;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = theme.colors.textSecondary;
                }}
              >
                ✕
              </button>
            </div>

            {/* Contenido del modal */}
            {loadingGroupInfo ? (
              <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.textSecondary }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <div>Cargando información...</div>
              </div>
            ) : conversacionInfo ? (
              <>
                {/* Nombre del grupo */}
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  background: `linear-gradient(145deg, ${theme.colors.primary}20, ${theme.colors.primaryLight}20)`,
                  borderRadius: '12px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: theme.colors.textSecondary,
                    marginBottom: '4px'
                  }}>
                    Nombre del grupo
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: theme.colors.text
                  }}>
                    {conversacionInfo.nombre || 'Sin nombre'}
                  </div>
                </div>

                {/* Participantes */}
                <div style={{
                  marginBottom: '16px',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: theme.colors.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>👤</span>
                  Participantes ({conversacionInfo.total_participantes || 0})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {conversacionInfo.participantes && conversacionInfo.participantes.map((participante) => (
                    <div
                      key={participante.id_user}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: theme.colors.cardBackground,
                        border: `1px solid ${theme.colors.primaryLight}40`,
                        borderRadius: '12px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = `${theme.colors.primary}10`;
                        e.currentTarget.style.borderColor = theme.colors.primary;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = theme.colors.cardBackground;
                        e.currentTarget.style.borderColor = `${theme.colors.primaryLight}40`;
                      }}
                    >
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: participante.foto_perfil ? 
                          `url(${participante.foto_perfil}) center/cover` :
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
                        {!participante.foto_perfil && (
                          `${participante.nombre?.[0]?.toUpperCase() || ''}${participante.apellido?.[0]?.toUpperCase() || ''}`
                        )}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: theme.colors.text,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {participante.nombre} {participante.apellido}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: theme.colors.textSecondary,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {participante.email}
                        </div>
                        {participante.rol && (
                          <div style={{
                            display: 'inline-block',
                            marginTop: '4px',
                            padding: '2px 8px',
                            background: participante.rol === 'docente' ? 
                              `${theme.colors.primary}30` : 
                              `${theme.colors.primaryLight}30`,
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: theme.colors.text,
                            textTransform: 'uppercase'
                          }}>
                            {participante.rol}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Información adicional */}
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: `${theme.colors.textSecondary}10`,
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: theme.colors.textSecondary
                }}>
                  <div>💡 <strong>Tipo:</strong> {conversacionInfo.tipo === 'grupal' ? 'Conversación grupal' : 'Conversación individual'}</div>
                  {conversacionInfo.fecha_creacion && (
                    <div style={{ marginTop: '8px' }}>
                      📅 <strong>Creado:</strong> {new Date(conversacionInfo.fecha_creacion).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.textSecondary }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                <div>No se pudo cargar la información</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailPanel;