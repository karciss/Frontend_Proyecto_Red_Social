import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { publicacionesService } from '../services/publicacionesService';
import mensajeriaService from '../services/mensajeriaService';
import '../styles/DetailPanel.css';
import '../styles/CarpoolingDetail.css';
import '../styles/Messages.css';
import '../styles/Social.css';

// Funciones para manejar fechas en hora de Bolivia (UTC-4)
const formatBoliviaTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/La_Paz'
  });
};

const formatBoliviaDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    ...options,
    timeZone: 'America/La_Paz'
  });
};

const getBoliviaDateString = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    timeZone: 'America/La_Paz'
  });
};

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
  
  // Estados para editar y eliminar mensajes
  const [openMessageMenuId, setOpenMessageMenuId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState('');
  const [showDeleteMessageModal, setShowDeleteMessageModal] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(false);
  
  // Estados para editar/eliminar publicación
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  
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
      // Marcar mensajes como leídos automáticamente al abrir la conversación
      marcarComoLeidos();
    }
  }, [item.id_conversacion]);

  // Scroll automático al final cuando cambian los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);
  
  // Cerrar menú de opciones al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showOptionsMenu && !e.target.closest('.options-menu-container')) {
        setShowOptionsMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showOptionsMenu]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const marcarComoLeidos = async () => {
    if (!item.id_conversacion) return;
    
    try {
      const result = await mensajeriaService.marcarMensajesLeidos(item.id_conversacion);
      if (result.error) {
        console.error('Error al marcar mensajes como leídos:', result.error);
      } else {
        console.log('✅ Mensajes marcados como leídos exitosamente');
        // Actualizar el item localmente para que el contador desaparezca inmediatamente
        if (item.mensajes_no_leidos && item.mensajes_no_leidos > 0) {
          item.mensajes_no_leidos = 0;
        }
      }
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
    }
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

  const handleEditMessage = async (mensajeId) => {
    if (!editMessageContent.trim()) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backend-social-f3ob.onrender.com/api/v1'}/mensajes/${mensajeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        },
        body: JSON.stringify({ contenido: editMessageContent })
      });
      
      if (response.ok) {
        setMensajes(prev => prev.map(msg => 
          msg.id_mensaje === mensajeId 
            ? { ...msg, contenido: editMessageContent, editado: true }
            : msg
        ));
        setEditingMessageId(null);
        setEditMessageContent('');
      } else {
        throw new Error('Error al actualizar mensaje');
      }
    } catch (error) {
      console.error('Error al editar mensaje:', error);
      alert('Error al editar el mensaje');
    }
  };

  const handleDeleteMessage = async () => {
    if (!deleteMessageId) return;
    
    setDeletingMessage(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backend-social-f3ob.onrender.com/api/v1'}/mensajes/${deleteMessageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        }
      });
      
      if (response.ok) {
        setMensajes(prev => prev.filter(msg => msg.id_mensaje !== deleteMessageId));
        setShowDeleteMessageModal(false);
        setDeleteMessageId(null);
      } else {
        throw new Error('Error al eliminar mensaje');
      }
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      alert('Error al eliminar el mensaje');
    } finally {
      setDeletingMessage(false);
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
  
  // Función para editar publicación
  const handleEditPost = async () => {
    if (!editedContent.trim()) return;
    
    try {
      // Preservar el prefijo [EVENTO] si existía
      const wasEvent = item.contenido && item.contenido.startsWith('[EVENTO]');
      const contenidoFinal = wasEvent ? `[EVENTO]${editedContent}` : editedContent;
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backend-social-f3ob.onrender.com/api/v1'}/publicaciones/${item.id_publicacion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        },
        body: JSON.stringify({ contenido: contenidoFinal })
      });
      
      if (response.ok) {
        // Actualizar localmente
        item.contenido = contenidoFinal;
        setEditMode(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
        
        // Recargar después de un momento
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      console.error('Error al editar:', error);
      setErrorText('Error al editar la publicación');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 4000);
    }
  };
  
  // Función para eliminar publicación
  const handleDeletePost = async () => {
    setDeletingPost(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backend-social-f3ob.onrender.com/api/v1'}/publicaciones/${item.id_publicacion}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        }
      });
      
      if (response.ok) {
        setShowDeleteModal(false);
        setShowSuccessMessage(true);
        setTimeout(() => {
          if (onClose) onClose();
          window.location.reload();
        }, 1500);
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      setErrorText('Error al eliminar la publicación');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 4000);
    } finally {
      setDeletingPost(false);
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
        // Convertir la fecha del mensaje a hora de Bolivia
        const fechaMensaje = new Date(mensaje.fecha_envio);
        const fechaBolivia = new Date(fechaMensaje.toLocaleString('en-US', { timeZone: 'America/La_Paz' }));
        
        // Obtener la fecha actual en Bolivia
        const ahora = new Date();
        const horaBolivia = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/La_Paz' }));
        
        // Resetear horas para comparar solo fechas
        const hoyBolivia = new Date(horaBolivia.getFullYear(), horaBolivia.getMonth(), horaBolivia.getDate());
        const mensajeDia = new Date(fechaBolivia.getFullYear(), fechaBolivia.getMonth(), fechaBolivia.getDate());
        const ayerBolivia = new Date(hoyBolivia);
        ayerBolivia.setDate(ayerBolivia.getDate() - 1);
        
        let label;
        if (mensajeDia.getTime() === hoyBolivia.getTime()) {
          label = 'Hoy';
        } else if (mensajeDia.getTime() === ayerBolivia.getTime()) {
          label = 'Ayer';
        } else {
          label = formatBoliviaDate(mensaje.fecha_envio, { day: 'numeric', month: 'long' });
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
        <div className="detail-content" style={{ 
          paddingBottom: '0',
          marginBottom: '0'
        }}>
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
                    // Obtener hora en Bolivia
                    const hora = formatBoliviaTime(mensaje.fecha_envio);
                    
                    return (
                      <div key={mensaje.id_mensaje} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: esMio ? 'flex-end' : 'flex-start' }}>
                        <div className={`message-bubble ${esMio ? 'sent' : 'received'}`} style={{ position: 'relative', paddingRight: esMio ? '35px' : undefined }}>
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
                          
                          {editingMessageId === mensaje.id_mensaje ? (
                            <div style={{ width: '100%' }}>
                              <textarea
                                value={editMessageContent}
                                onChange={(e) => setEditMessageContent(e.target.value)}
                                style={{
                                  width: '100%',
                                  minHeight: '60px',
                                  padding: '8px',
                                  fontSize: '14px',
                                  lineHeight: '1.5',
                                  color: theme.colors.text,
                                  background: theme.colors.cardBackground,
                                  border: `2px solid ${theme.colors.primary}`,
                                  borderRadius: '8px',
                                  resize: 'vertical',
                                  fontFamily: 'inherit'
                                }}
                                autoFocus
                              />
                              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                <button
                                  onClick={() => handleEditMessage(mensaje.id_mensaje)}
                                  style={{
                                    padding: '8px 16px',
                                    background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingMessageId(null);
                                    setEditMessageContent('');
                                  }}
                                  style={{
                                    padding: '8px 16px',
                                    background: '#374151',
                                    color: 'white',
                                    border: `1px solid ${theme.colors.textSecondary}`,
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="message-text">{mensaje.contenido}</div>
                              {mensaje.editado && (
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>editado</div>
                              )}
                            </>
                          )}
                          
                          <div className="message-time">{hora}</div>
                          
                          {esMio && editingMessageId !== mensaje.id_mensaje && (
                            <button
                              onClick={() => setOpenMessageMenuId(openMessageMenuId === mensaje.id_mensaje ? null : mensaje.id_mensaje)}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '16px',
                                cursor: 'pointer',
                                padding: '2px 6px',
                                lineHeight: 1
                              }}
                            >
                              ⋮
                            </button>
                          )}
                          
                          {openMessageMenuId === mensaje.id_mensaje && esMio && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              right: '0',
                              marginTop: '4px',
                              background: theme.colors.cardBackground,
                              border: `1px solid ${theme.colors.primaryLight}40`,
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                              overflow: 'hidden',
                              zIndex: 100,
                              minWidth: '120px'
                            }}>
                              <button
                                onClick={() => {
                                  setEditingMessageId(mensaje.id_mensaje);
                                  setEditMessageContent(mensaje.contenido);
                                  setOpenMessageMenuId(null);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: theme.colors.text,
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteMessageId(mensaje.id_mensaje);
                                  setShowDeleteMessageModal(true);
                                  setOpenMessageMenuId(null);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ff4444',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          )}
                        </div>
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
        
        {/* Modal de confirmación para eliminar mensaje */}
        {showDeleteMessageModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
          }}>
            <div style={{
              background: theme.colors.cardBackground,
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                fontSize: '48px',
                textAlign: 'center',
                marginBottom: '16px'
              }}>⚠️</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: theme.colors.text,
                textAlign: 'center',
                marginBottom: '12px'
              }}>
                Eliminar mensaje
              </h3>
              <p style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                ¿Estás seguro de que quieres eliminar este mensaje? Esta acción no se puede deshacer.
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => {
                    setShowDeleteMessageModal(false);
                    setDeleteMessageId(null);
                  }}
                  disabled={deletingMessage}
                  style={{
                    padding: '10px 24px',
                    background: theme.colors.textSecondary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: deletingMessage ? 'not-allowed' : 'pointer',
                    opacity: deletingMessage ? 0.5 : 1
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteMessage}
                  disabled={deletingMessage}
                  style={{
                    padding: '10px 24px',
                    background: deletingMessage ? '#999' : '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: deletingMessage ? 'not-allowed' : 'pointer'
                  }}
                >
                  {deletingMessage ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
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
          background: theme.colors.cardBackground,
          borderRadius: '16px',
          border: `1px solid ${theme.colors.primaryLight}20`,
          position: 'relative'
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
            
            {/* Content o Edit mode */}
            {editMode ? (
              <div style={{ marginBottom: '12px' }}>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    color: theme.colors.text,
                    background: theme.colors.cardBackground,
                    border: `2px solid ${theme.colors.primary}`,
                    borderRadius: '8px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  autoFocus
                />
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '12px'
                }}>
                  <button
                    onClick={handleEditPost}
                    style={{
                      padding: '10px 24px',
                      background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditedContent((item.contenido || item.title || '').replace('[EVENTO]', ''));
                    }}
                    style={{
                      padding: '10px 24px',
                      background: theme.colors.textSecondary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ 
                fontSize: '16px',
                lineHeight: '1.6',
                color: theme.colors.text,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {(item.contenido || item.title || '').replace('[EVENTO]', '')}
              </div>
            )}
          </div>
          
          {/* Options menu button - only for post owner */}
          {user && item.id_user === user.id_user && !editMode && (
            <div className="options-menu-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  lineHeight: 1
                }}
                title="Opciones"
              >
                ⋮
              </button>
              
              {showOptionsMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  background: theme.colors.cardBackground,
                  border: `1px solid ${theme.colors.primaryLight}40`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  zIndex: 1000,
                  minWidth: '150px'
                }}>
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setEditMode(true);
                      setEditedContent((item.contenido || item.title || '').replace('[EVENTO]', ''));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      color: theme.colors.text,
                      fontSize: '15px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = `${theme.colors.primary}20`}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowDeleteModal(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      color: theme.colors.notification,
                      fontSize: '15px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = `${theme.colors.notification}20`}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              )}
            </div>
          )}
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
                    background: theme.colors.cardBackground,
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
          background: theme.colors.cardBackground,
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
    <div className="detail-panel" style={{ background: '#000000' }}>
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
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
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
          zIndex: 10001,
          padding: '20px'
        }}
        onClick={() => !deletingPost && setShowDeleteModal(false)}
        >
          <div style={{
            background: theme.colors.cardBackground,
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            border: `1px solid ${theme.colors.primaryLight}40`
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              fontSize: '48px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              ⚠️
            </div>
            <h3 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: theme.colors.text,
              textAlign: 'center',
              marginBottom: '12px'
            }}>
              Eliminar publicación
            </h3>
            <p style={{
              fontSize: '16px',
              color: theme.colors.textSecondary,
              textAlign: 'center',
              marginBottom: '32px',
              lineHeight: '1.5'
            }}>
              ¿Estás seguro que quieres eliminar esta publicación? Esta acción no se puede deshacer.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingPost}
                style={{
                  padding: '12px 32px',
                  background: theme.colors.textSecondary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: deletingPost ? 'not-allowed' : 'pointer',
                  opacity: deletingPost ? 0.5 : 1
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePost}
                disabled={deletingPost}
                style={{
                  padding: '12px 32px',
                  background: deletingPost ? theme.colors.textSecondary : 'linear-gradient(145deg, #ef4444, #f87171)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: deletingPost ? 'not-allowed' : 'pointer',
                  opacity: deletingPost ? 0.7 : 1
                }}
              >
                {deletingPost ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
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