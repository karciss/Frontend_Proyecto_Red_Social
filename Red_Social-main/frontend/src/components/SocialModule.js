import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { publicacionesService } from '../services/publicacionesService';
import { uploadFiles, validateFiles, getMediaType } from '../services/uploadService';
import DetailPanel from './DetailPanel';
import '../styles/Social.css';

const SocialModule = ({ onSelectItem, selectedItem }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Estados para las publicaciones y eventos
  const [activeTab, setActiveTab] = useState('recientes');
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileType, setFileType] = useState('imagen'); // imagen, documento, enlace
  const fileInputRef = useRef(null);
  const [eventos, setEventos] = useState([
    {
      id: 'ev1',
      titulo: 'Feria Cultural - La Fevalle',
      descripcion: 'Actividades culturales y presentaciones artísticas en el campus.',
      fecha: '2025-11-02T18:00:00',
      lugar: 'Plaza Central',
      organizador: 'Comité Cultural'
    },
    {
      id: 'ev2',
      titulo: 'Campeonato de Futsal',
      descripcion: 'Torneo interfacultades de futsal. Inscripciones abiertas para equipos.',
      fecha: '2025-11-15T09:00:00',
      lugar: 'Gimnasio Principal',
      organizador: 'Departamento de Deportes'
    }
  ]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ titulo: '', descripcion: '', fecha: '', lugar: '' });

  // Cargar publicaciones desde el backend
  useEffect(() => {
    loadPublicaciones();
  }, []);

  const loadPublicaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await publicacionesService.getFeed(0, 50);
      
      if (apiError) {
        setError(apiError);
        console.error('Error al cargar publicaciones:', apiError);
      } else {
        setPublicaciones(data || []);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error('Error inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva publicación
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      alert('Por favor escribe algo para publicar');
      return;
    }

    try {
      setCreatingPost(true);
      
      // Determinar el tipo de publicación basado en los archivos seleccionados
      let tipoPublicacion = 'texto';
      let mediaUrls = [];
      
      if (selectedFiles.length > 0) {
        // Subir archivos y obtener URLs
        const uploadResult = await uploadFiles(selectedFiles);
        
        if (uploadResult.error) {
          setErrorText(uploadResult.error);
          setShowErrorMessage(true);
          setTimeout(() => setShowErrorMessage(false), 4000);
          return;
        }
        
        mediaUrls = uploadResult.data || [];
        
        // Determinar tipo basado en el primer archivo (pasar el objeto File completo)
        tipoPublicacion = getMediaType(selectedFiles[0]);
      }
      
      const { data, error: apiError } = await publicacionesService.create({
        contenido: newPostContent,
        tipo: tipoPublicacion,
        media_urls: mediaUrls
      });

      if (apiError) {
        console.error('Error detallado:', apiError);
        setErrorText(typeof apiError === 'string' ? apiError : 'Error al crear publicación');
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
        
        // Si hay archivos pero el backend no devolvió media, agregarlo manualmente
        if (mediaUrls.length > 0 && (!data.media || data.media.length === 0)) {
          data.media = mediaUrls.map((url, index) => ({
            id_media: `temp_${Date.now()}_${index}`,
            url: url,
            tipo: tipoPublicacion,
            id_publicacion: data.id_publicacion
          }));
        }
        
        // Agregar la nueva publicación al inicio
        setPublicaciones([data, ...publicaciones]);
        setNewPostContent('');
        setSelectedFiles([]);
        
        // Mostrar mensaje de éxito
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (err) {
      console.error('Error:', err);
      setErrorText('Error inesperado al crear publicación');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 4000);
    } finally {
      setCreatingPost(false);
    }
  };

  // Manejar selección de archivos
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar archivos
    const validation = validateFiles(files, {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    });
    
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = '';
  };

  // Remover archivo seleccionado
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Manejar reacción a una publicación
  const handleReaccion = async (idPublicacion, tipoReaccion = 'like') => {
    try {
      const { data, error: apiError } = await publicacionesService.reaccionar(idPublicacion, tipoReaccion);
      
      if (apiError) {
        // Asegurar que el error sea siempre un string
        const errorMessage = typeof apiError === 'string' ? apiError : JSON.stringify(apiError);
        setErrorText(errorMessage);
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 3000);
      } else {
        // Actualizar el contador de reacciones localmente
        setPublicaciones(prevPubs => 
          prevPubs.map(pub => 
            pub.id_publicacion === idPublicacion 
              ? { ...pub, reacciones_count: (pub.reacciones_count || 0) + 1 }
              : pub
          )
        );
      }
    } catch (err) {
      console.error('Error al reaccionar:', err);
      setErrorText('Error al reaccionar');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  // Abrir selector de archivos
  const openFileSelector = (type) => {
    setFileType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'imagen' ? 'image/*' : 
                                     type === 'documento' ? '.pdf,.doc,.docx,.txt' : '*/*';
      fileInputRef.current.click();
    }
  };

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showEventForm) setShowEventForm(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showEventForm]);

  const titleRef = useRef(null);
  // Autofocus en el título cuando se abre el modal
  useEffect(() => {
    if (showEventForm) {
      setTimeout(() => titleRef.current && titleRef.current.focus(), 50);
    }
  }, [showEventForm]);
  
  // Manejador para seleccionar una publicación
  const handleSelectPublicacion = async (publicacion) => {
    // Cargar comentarios reales del backend
    const { data: comentarios } = await publicacionesService.getComentarios(publicacion.id_publicacion);
    
    onSelectItem({
      ...publicacion,
      tipo: publicacion.tipo || 'social',
      userHandle: publicacion.usuario?.nombre?.toLowerCase().replace(' ', '') || 'usuario',
      userName: publicacion.usuario?.nombre || 'Usuario',
      userAvatar: publicacion.usuario?.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(publicacion.usuario?.nombre || 'U')}&background=random`,
      title: publicacion.contenido.substring(0, 30) + (publicacion.contenido.length > 30 ? '...' : ''),
      image: publicacion.media?.[0]?.url || null,
      price: publicacion.reacciones_count || 0,
      id: publicacion.id_publicacion,
      comentarios: comentarios || []
    });
  };

  // Manejador para seleccionar un evento (abre detalle similar a una publicación)
  const handleSelectEvent = (ev) => {
    const comentariosFicticios = [
      {
        id: `c-1-${ev.id}`,
        userName: 'Usuario A',
        userAvatar: `https://ui-avatars.com/api/?name=Usuario+A&background=random`,
        contenido: '¡Interesante, me apunto!',
        fecha: new Date().toISOString()
      }
    ];

    onSelectItem({
      id: ev.id,
      tipo: 'evento',
      title: ev.titulo,
      contenido: ev.descripcion,
      userName: ev.organizador || 'Organizador',
      userHandle: (ev.organizador || 'organizador').toLowerCase().replace(/\s+/g, ''),
      image: null,
      comentarios: comentariosFicticios,
      fecha: ev.fecha,
      lugar: ev.lugar
    });
  };

  return (
    <>
      {/* Mensaje de éxito flotante */}
      {showSuccessMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: `linear-gradient(145deg, ${theme.colors.success || '#10b981'}, ${theme.colors.successLight || '#34d399'})`,
          color: 'white',
          padding: '16px 32px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 9999,
          animation: 'slideDown 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '15px',
          fontWeight: '600'
        }}>
          <span style={{ fontSize: '24px' }}>✅</span>
          ¡Publicación creada exitosamente!
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
          padding: '16px 32px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 9999,
          animation: 'slideDown 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '15px',
          fontWeight: '600'
        }}>
          <span style={{ fontSize: '24px' }}>❌</span>
          {typeof errorText === 'string' ? errorText : JSON.stringify(errorText)}
        </div>
      )}
      
      <div className="collections-section">
        <div className="collections-header">
          <h2 className="collections-title">Red Social Universitaria</h2>
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Buscar publicaciones..." 
              className="search-input" 
            />
            <span className="search-icon">🔍</span>
          </div>
          <button 
            className="primary-button" 
            style={{ background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})` }}
            onClick={() => document.getElementById('newPostInput').focus()}
          >
            Nueva Publicación
          </button>
        </div>
        
        <div className="new-post-form" style={{
          background: `linear-gradient(145deg, ${theme.colors.cardBackground}dd, ${theme.colors.cardBackground}ee)`,
          backdropFilter: 'blur(10px)',
          border: `2px solid ${theme.colors.primaryLight}40`,
          borderRadius: '16px',
          padding: '12px',
          marginBottom: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white',
              flexShrink: 0
            }}>
              {user?.nombre?.[0]?.toUpperCase() || '👤'}
            </div>
            <div style={{ flex: 1 }}>
              <textarea 
                id="newPostInput"
                className="new-post-input"
                placeholder="¿Qué está pasando en la universidad?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  borderRadius: '12px',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  background: theme.colors.cardBackground,
                  color: theme.colors.text,
                  resize: 'vertical',
                  minHeight: '60px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
          </div>
          
          {/* Vista previa compacta de archivos */}
          {selectedFiles.length > 0 && (
            <div style={{
              marginTop: '8px',
              padding: '6px 10px',
              background: `${theme.colors.primaryLight}10`,
              borderRadius: '8px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <span style={{ opacity: 0.7 }}>📎 {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''}</span>
              {selectedFiles.map((file, index) => (
                <span key={index} style={{
                  padding: '2px 8px',
                  background: theme.colors.cardBackground,
                  borderRadius: '6px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                  <button
                    onClick={() => removeFile(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '0 2px',
                      color: '#ef4444'
                    }}
                  >×</button>
                </span>
              ))}
            </div>
          )}
          
          <div className="new-post-actions" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '8px',
            borderTop: `1px solid ${theme.colors.primaryLight}20`
          }}>
            {/* Input de archivo oculto */}
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              style={{ display: 'none' }}
            />
            
            <div className="post-attachments" style={{
              display: 'flex',
              gap: '4px',
              alignItems: 'center'
            }}>
              <button 
                className="attachment-button" 
                title="Añadir imagen"
                onClick={() => openFileSelector('imagen')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(147, 51, 234, 0.1)',
                  color: theme.colors.text,
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                📷
              </button>
              <button 
                className="attachment-button" 
                title="Añadir documento"
                onClick={() => openFileSelector('documento')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(147, 51, 234, 0.1)',
                  color: theme.colors.text,
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                📄
              </button>
              <button 
                className="attachment-button" 
                title="Añadir enlace"
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(147, 51, 234, 0.1)',
                  color: theme.colors.text,
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                🔗
              </button>
            </div>
            <button 
              className="post-button"
              onClick={handleCreatePost}
              disabled={creatingPost || !newPostContent.trim()}
              style={{ 
                padding: '12px 32px',
                borderRadius: '12px',
                border: 'none',
                background: (creatingPost || !newPostContent.trim()) 
                  ? 'rgba(255,255,255,0.1)' 
                  : `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: (creatingPost || !newPostContent.trim()) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: (!creatingPost && newPostContent.trim()) 
                  ? `0 4px 12px ${theme.colors.primary}40` 
                  : 'none',
                opacity: (creatingPost || !newPostContent.trim()) ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!creatingPost && newPostContent.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 6px 20px ${theme.colors.primary}60`;
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = (!creatingPost && newPostContent.trim()) 
                  ? `0 4px 12px ${theme.colors.primary}40` 
                  : 'none';
              }}
            >
              {creatingPost ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="spinner" style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></span>
                  Publicando...
                </span>
              ) : (
                <>✨ Publicar</>
              )}
            </button>
          </div>
        </div>
        
        <div className="tab-selector">
          <div 
            className={`tab-item ${activeTab === 'recientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recientes')}
          >
            Recientes
          </div>
          <div 
            className={`tab-item ${activeTab === 'populares' ? 'active' : ''}`}
            onClick={() => setActiveTab('populares')}
          >
            Populares
          </div>
          <div 
            className={`tab-item ${activeTab === 'amigos' ? 'active' : ''}`}
            onClick={() => setActiveTab('amigos')}
          >
            Amigos
          </div>
          <div 
            className={`tab-item ${activeTab === 'eventos' ? 'active' : ''}`}
            onClick={() => setActiveTab('eventos')}
          >
            Eventos
          </div>
        </div>
        
        {/* Header de eventos: solo visible cuando activeTab === 'eventos' */}
        {activeTab === 'eventos' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Eventos</h3>
            <button 
              className="primary-button" 
              style={{ background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})` }}
              onClick={() => setShowEventForm(true)}
            >
              Crear Evento
            </button>
          </div>
        )}
        
        <div className="collections-grid social-posts">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
              <p>Cargando publicaciones...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1', color: '#e74c3c' }}>
              <p>❌ {error}</p>
              <button 
                onClick={loadPublicaciones}
                style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
              >
                Reintentar
              </button>
            </div>
          ) : activeTab !== 'eventos' ? (
            publicaciones.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                <p>No hay publicaciones aún. ¡Sé el primero en publicar!</p>
              </div>
            ) : (
              publicaciones
                .filter(publicacion => {
                  if (activeTab === 'recientes') return true;
                  if (activeTab === 'populares') return (publicacion.reacciones_count || 0) >= 5;
                  if (activeTab === 'amigos') return true; // TODO: implementar lógica de amigos
                  return true;
                })
                .map((publicacion) => (
                  <div 
                    key={publicacion.id_publicacion} 
                    className="collection-card social-post" 
                    onClick={() => handleSelectPublicacion(publicacion)}
                    style={{ 
                      width: '100%',
                      background: `linear-gradient(145deg, ${theme.colors.primaryDark}30, ${theme.colors.primaryLight}20)`
                    }}
                  >
                  <div className="card-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        <img 
                          src={publicacion.usuario?.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(publicacion.usuario?.nombre || 'U')}&background=random`} 
                          alt={publicacion.usuario?.nombre || 'Usuario'} 
                        />
                      </div>
                      <div className="user-name">{publicacion.usuario?.nombre || 'Usuario'} {publicacion.usuario?.apellido || ''}</div>
                    </div>
                    <div className="publication-date">
                      {new Date(publicacion.fecha_creacion).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  
                  <div className="post-content">
                    <p>{publicacion.contenido}</p>
                    
                    {/* Mostrar media desde el array media[] o desde media_urls[] */}
                    {((publicacion.media && publicacion.media.length > 0) || (publicacion.media_urls && publicacion.media_urls.length > 0)) && (
                      <div className="post-media" style={{
                        marginTop: '12px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'grid',
                        gridTemplateColumns: (publicacion.media?.length === 1 || publicacion.media_urls?.length === 1) ? '1fr' : 'repeat(2, 1fr)',
                        gap: '8px',
                        maxHeight: '500px'
                      }}>
                        {/* Renderizar desde media[] (formato backend con relaciones) */}
                        {publicacion.media && publicacion.media.map((media, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            {(media.tipo === 'imagen' || media.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                              <img 
                                src={media.url} 
                                alt={`Media ${idx + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  maxHeight: publicacion.media.length === 1 ? '500px' : '250px'
                                }}
                              />
                            )}
                            {media.tipo === 'video' && (
                              <video 
                                src={media.url} 
                                controls
                                style={{
                                  width: '100%',
                                  maxHeight: '400px',
                                  borderRadius: '8px'
                                }}
                              />
                            )}
                            {media.tipo === 'documento' && (
                              <div style={{
                                padding: '20px',
                                background: 'rgba(147, 51, 234, 0.1)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                              }}>
                                <span style={{ fontSize: '32px' }}>📄</span>
                                <div>
                                  <div style={{ fontWeight: '600' }}>Documento adjunto</div>
                                  <a 
                                    href={media.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                      color: theme.colors.primary,
                                      fontSize: '14px',
                                      textDecoration: 'none'
                                    }}
                                  >
                                    Abrir documento
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Renderizar desde media_urls[] (formato directo sin relaciones) */}
                        {!publicacion.media && publicacion.media_urls && publicacion.media_urls.map((url, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                              <img 
                                src={url} 
                                alt={`Media ${idx + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  maxHeight: publicacion.media_urls.length === 1 ? '500px' : '250px'
                                }}
                              />
                            )}
                            {url.match(/\.(mp4|webm|ogg)$/i) && (
                              <video 
                                src={url} 
                                controls
                                style={{
                                  width: '100%',
                                  maxHeight: '400px',
                                  borderRadius: '8px'
                                }}
                              />
                            )}
                            {url.match(/\.(pdf|doc|docx|xls|xlsx)$/i) && (
                              <div style={{
                                padding: '20px',
                                background: 'rgba(147, 51, 234, 0.1)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                              }}>
                                <span style={{ fontSize: '32px' }}>📄</span>
                                <div>
                                  <div style={{ fontWeight: '600' }}>Documento adjunto</div>
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                      color: theme.colors.primary,
                                      fontSize: '14px',
                                      textDecoration: 'none'
                                    }}
                                  >
                                    Abrir documento
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="card-footer">
                    <div className="post-actions" style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '12px 0',
                      borderTop: `1px solid ${theme.colors.primaryLight}20`
                    }}>
                      {/* Botón de reacciones con selector tipo Facebook */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReaccion(publicacion.id_publicacion);
                          }}
                          onMouseEnter={(e) => {
                            const reactionPicker = e.currentTarget.nextSibling;
                            if (reactionPicker) reactionPicker.style.display = 'flex';
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: theme.colors.text,
                            fontSize: '14px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = `${theme.colors.primary}20`}
                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                        >
                          👍 <span style={{ fontSize: '13px', fontWeight: '500' }}>{publicacion.reacciones_count || 0}</span>
                        </button>
                        
                        {/* Selector de reacciones */}
                        <div
                          onMouseLeave={(e) => e.currentTarget.style.display = 'none'}
                          style={{
                            display: 'none',
                            position: 'absolute',
                            bottom: '100%',
                            left: '0',
                            background: theme.colors.cardBackground,
                            padding: '8px',
                            borderRadius: '25px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            gap: '4px',
                            marginBottom: '8px',
                            border: `2px solid ${theme.colors.primaryLight}40`,
                            zIndex: 100
                          }}
                        >
                          {[
                            { emoji: '👍', name: 'like' },
                            { emoji: '❤️', name: 'love' },
                            { emoji: '😂', name: 'wow' },
                            { emoji: '😮', name: 'wow' },
                            { emoji: '😢', name: 'sad' },
                            { emoji: '😠', name: 'angry' }
                          ].map((reaction) => (
                            <button
                              key={reaction.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReaccion(publicacion.id_publicacion, reaction.name);
                                e.currentTarget.parentElement.style.display = 'none';
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '24px',
                                padding: '6px',
                                borderRadius: '50%',
                                transition: 'transform 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              title={reaction.name}
                            >
                              {reaction.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPublicacion(publicacion);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: theme.colors.text,
                          fontSize: '14px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = `${theme.colors.primary}20`}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                      >
                        💬 <span style={{ fontSize: '13px', fontWeight: '500' }}>{publicacion.comentarios_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            // Renderizar eventos cuando la pestaña activa es 'eventos'
            <>
              {eventos.length === 0 && <div>No hay eventos programados.</div>}
              {eventos.map(ev => (
                <div key={ev.id} className="collection-card event-card" onClick={() => handleSelectEvent(ev)}>
                  <div className="event-card-header">
                    <div className="event-icon">📅</div>
                    <div className="event-badge">Evento</div>
                  </div>
                  
                  <div className="event-card-body">
                    <h4 className="event-title">{ev.titulo}</h4>
                    
                    <div className="event-details">
                      <div className="event-detail-item">
                        <span className="event-detail-icon">🕒</span>
                        <span className="event-detail-text">{new Date(ev.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(ev.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="event-detail-item">
                        <span className="event-detail-icon">📍</span>
                        <span className="event-detail-text">{ev.lugar}</span>
                      </div>
                    </div>
                    
                    <p className="event-description">{ev.descripcion}</p>
                  </div>
                  
                  <div className="event-card-footer">
                    <div className="event-organizer">
                      <div className="event-organizer-avatar">
                        {(ev.organizador || 'O')[0].toUpperCase()}
                      </div>
                      <div className="event-organizer-info">
                        <span className="event-organizer-label">Organiza</span>
                        <span className="event-organizer-name">{ev.organizador || 'Universidad'}</span>
                      </div>
                    </div>
                    <button className="event-comment-btn" onClick={(e) => { e.stopPropagation(); handleSelectEvent(ev); }}>
                      💬
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      
      {/* Modal para crear evento - fuera del grid */}
      {showEventForm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={(e) => { if (e.target === e.currentTarget) setShowEventForm(false); }}>
          <div className="modal-content new-event-modal" style={{ maxWidth: 720, width: '95%', margin: '40px auto', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Crear Evento</h3>
              <button className="modal-close" aria-label="Cerrar" onClick={() => setShowEventForm(false)}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              <input ref={titleRef} type="text" placeholder="Título del evento" value={newEvent.titulo} onChange={e => setNewEvent({...newEvent, titulo: e.target.value})} style={{ width: '100%' }} />
              <input type="datetime-local" placeholder="Fecha y hora" value={newEvent.fecha} onChange={e => setNewEvent({...newEvent, fecha: e.target.value})} style={{ width: '100%' }} />
              <input type="text" placeholder="Lugar" value={newEvent.lugar} onChange={e => setNewEvent({...newEvent, lugar: e.target.value})} style={{ width: '100%' }} />
              <textarea placeholder="Descripción" value={newEvent.descripcion} onChange={e => setNewEvent({...newEvent, descripcion: e.target.value})} style={{ width: '100%' }} />
            </div>

            <div style={{ textAlign: 'right', marginTop: 12 }}>
              <button className="post-button" onClick={() => {
                if (!newEvent.titulo || !newEvent.fecha) return alert('Completa título y fecha');
                const ev = { ...newEvent, id: `ev${Date.now()}` };
                setEventos(prev => [ev, ...prev]);
                setNewEvent({ titulo: '', descripcion: '', fecha: '', lugar: '' });
                setShowEventForm(false);
              }} style={{ background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})` }}>Guardar Evento</button>
            </div>
          </div>
        </div>
      )}
      
      {selectedItem && (
        <DetailPanel 
          item={selectedItem} 
          onClose={() => onSelectItem(null)}
          onUpdateComentarios={(idPublicacion) => {
            setPublicaciones(prevPubs => 
              prevPubs.map(pub => 
                pub.id_publicacion === idPublicacion 
                  ? { ...pub, comentarios_count: (pub.comentarios_count || 0) + 1 }
                  : pub
              )
            );
          }}
        />
      )}
    </>
  );
};

export default SocialModule;