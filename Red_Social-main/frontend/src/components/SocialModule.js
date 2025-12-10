import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { publicacionesService } from '../services/publicacionesService';
import { uploadFiles, validateFiles, getMediaType } from '../services/uploadService';
import amigosService from '../services/amigosService';
import DetailPanel from './DetailPanel';
import '../styles/Social.css';

const SocialModule = ({ onSelectItem, selectedItem }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Estados para las publicaciones y eventos
  const [activeTab, setActiveTab] = useState('recientes');
  const [popularSubTab, setPopularSubTab] = useState('reacciones'); // 'reacciones' o 'comentarios'
  const [publicaciones, setPublicaciones] = useState([]);
  const [amigos, setAmigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileType, setFileType] = useState('imagen'); // imagen, documento, enlace
  const [isEventPost, setIsEventPost] = useState(false); // Marcar si la publicación es un evento
  const [openMenuId, setOpenMenuId] = useState(null); // ID de la publicación con menú abierto
  const [editingPostId, setEditingPostId] = useState(null); // ID de la publicación en edición
  const [editContent, setEditContent] = useState(''); // Contenido editado
  const [editFiles, setEditFiles] = useState([]); // Archivos para edición
  const [editFileType, setEditFileType] = useState('imagen'); // Tipo de archivo en edición
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);
  const [deletingPost, setDeletingPost] = useState(false);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Cargar publicaciones desde el backend
  useEffect(() => {
    loadPublicaciones();
    loadAmigos();
  }, []);

  // Verificar si el usuario puede crear eventos (solo admins y profesores)
  const canCreateEvents = () => {
    if (!user) return false;
    const rol = user.rol?.toLowerCase();
    return rol === 'admin' || rol === 'administrador' || rol === 'profesor' || rol === 'docente';
  };

  const loadAmigos = async () => {
    try {
      const response = await amigosService.obtenerAmigos();
      console.log('📋 Amigos cargados:', response);
      
      let amigosData = [];
      if (Array.isArray(response)) {
        amigosData = response;
      } else if (response && Array.isArray(response.data)) {
        amigosData = response.data;
      } else if (response && response.amigos && Array.isArray(response.amigos)) {
        amigosData = response.amigos;
      }
      
      console.log('👥 Total de amigos:', amigosData.length);
      console.log('👥 IDs de amigos:', amigosData.map(a => ({
        id: a.amigo?.id_user || a.id_user,
        nombre: a.amigo?.nombre || a.nombre
      })));
      setAmigos(amigosData);
    } catch (error) {
      console.error('❌ Error al cargar amigos:', error);
      setAmigos([]);
    }
  };

  const loadPublicaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: apiError } = await publicacionesService.getFeed(0, 50);
      
      if (apiError) {
        setError(apiError);
        console.error('Error al cargar publicaciones:', apiError);
      } else {
        console.log('📰 Publicaciones cargadas:', data?.length);
        console.log('📰 Autores:', data?.map(p => ({
          id: p.usuario?.id_user,
          nombre: p.usuario?.nombre
        })));
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
      
      // Agregar prefijo [EVENTO] si es un evento
      const contenidoFinal = isEventPost ? `[EVENTO]${newPostContent}` : newPostContent;
      
      const { data, error: apiError } = await publicacionesService.create({
        contenido: contenidoFinal,
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
        setIsEventPost(false);
        
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
  
  // Función para editar publicación desde la card
  const handleEditPost = async (publicacionId) => {
    if (!editContent.trim()) return;
    
    try {
      const publicacion = publicaciones.find(p => p.id_publicacion === publicacionId);
      const wasEvent = publicacion?.contenido && publicacion.contenido.startsWith('[EVENTO]');
      const contenidoFinal = wasEvent ? `[EVENTO]${editContent}` : editContent;
      
      let mediaUrls = publicacion.media_urls || [];
      
      // Si hay nuevos archivos, subirlos
      if (editFiles.length > 0) {
        const uploadedUrls = await uploadFiles(editFiles, editFileType);
        if (uploadedUrls && uploadedUrls.length > 0) {
          mediaUrls = uploadedUrls;
        }
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backend-social-f3ob.onrender.com/api/v1'}/publicaciones/${publicacionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        },
        body: JSON.stringify({ 
          contenido: contenidoFinal,
          media_urls: mediaUrls
        })
      });
      
      if (response.ok) {
        // Actualizar localmente
        setPublicaciones(prev => prev.map(pub => 
          pub.id_publicacion === publicacionId 
            ? { ...pub, contenido: contenidoFinal, media_urls: mediaUrls }
            : pub
        ));
        setEditingPostId(null);
        setEditContent('');
        setEditFiles([]);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
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
  
  // Función para eliminar publicación desde la card
  const handleDeletePost = async () => {
    if (!deletePostId) return;
    
    setDeletingPost(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backend-social-f3ob.onrender.com/api/v1'}/publicaciones/${deletePostId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('user-token')}`
        }
      });
      
      if (response.ok) {
        // Eliminar de la lista local
        setPublicaciones(prev => prev.filter(pub => pub.id_publicacion !== deletePostId));
        setShowDeleteModal(false);
        setDeletePostId(null);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
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
              background: user?.foto_perfil ? `url(${user.foto_perfil}) center/cover` : `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white',
              flexShrink: 0,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {!user?.foto_perfil && (user?.nombre?.[0]?.toUpperCase() || '👤')}
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
          
          {/* Checkbox para marcar como evento (solo admins y docentes) */}
          {canCreateEvents() && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              background: isEventPost ? `${theme.colors.primary}20` : 'transparent',
              borderRadius: '8px',
              border: `1px solid ${isEventPost ? theme.colors.primary : 'transparent'}`,
              transition: 'all 0.3s ease'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: theme.colors.text
              }}>
                <input
                  type="checkbox"
                  checked={isEventPost}
                  onChange={(e) => setIsEventPost(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: theme.colors.primary
                  }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📅 <span>Publicar como evento</span>
                </span>
              </label>
              {isEventPost && (
                <p style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                  marginTop: '6px',
                  marginLeft: '26px'
                }}>
                  Esta publicación aparecerá en la pestaña de Eventos
                </p>
              )}
            </div>
          )}
          
          <div className="new-post-actions" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '8px',
            borderTop: `1px solid ${theme.colors.primaryLight}20`
          }}>
            {/* Input de archivo oculto para nueva publicación */}
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              style={{ display: 'none' }}
            />
            
            {/* Input de archivo oculto para edición */}
            <input 
              type="file"
              ref={editFileInputRef}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  setEditFiles(files);
                }
              }}
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
        
        {/* Sub-tabs para Populares */}
        {activeTab === 'populares' && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
            padding: '8px',
            background: `${theme.colors.cardBackground}40`,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.primaryLight}20`
          }}>
            <button
              onClick={() => setPopularSubTab('reacciones')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: popularSubTab === 'reacciones' 
                  ? `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`
                  : 'transparent',
                color: popularSubTab === 'reacciones' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: popularSubTab === 'reacciones' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => {
                if (popularSubTab !== 'reacciones') {
                  e.currentTarget.style.background = `${theme.colors.primary}20`;
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseOut={(e) => {
                if (popularSubTab !== 'reacciones') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                }
              }}
            >
              ❤️ Más Reaccionados
            </button>
            <button
              onClick={() => setPopularSubTab('comentarios')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: popularSubTab === 'comentarios' 
                  ? `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`
                  : 'transparent',
                color: popularSubTab === 'comentarios' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: popularSubTab === 'comentarios' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => {
                if (popularSubTab !== 'comentarios') {
                  e.currentTarget.style.background = `${theme.colors.primary}20`;
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseOut={(e) => {
                if (popularSubTab !== 'comentarios') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                }
              }}
            >
              💬 Más Comentados
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
            (() => {
              const filteredPublicaciones = publicaciones
                .filter(publicacion => {
                  // Excluir eventos de otras pestañas (solo mostrarlos en la pestaña Eventos)
                  if (publicacion.contenido && publicacion.contenido.startsWith('[EVENTO]')) {
                    return false;
                  }
                  
                  if (activeTab === 'recientes') return true;
                  if (activeTab === 'populares') {
                    // Filtrar dinámicamente según el sub-tab seleccionado
                    if (popularSubTab === 'reacciones') {
                      return (publicacion.reacciones_count || 0) >= 1;
                    } else if (popularSubTab === 'comentarios') {
                      return (publicacion.comentarios_count || 0) >= 1;
                    }
                    return true;
                  }
                  if (activeTab === 'amigos') {
                    // Obtener el id del autor de la publicación (puede estar en usuario.id_user o directamente en id_user)
                    const autorId = publicacion.usuario?.id_user || publicacion.id_user;
                    
                    if (!autorId) {
                      console.log('⚠️ Publicación sin id de autor:', publicacion);
                      return false;
                    }
                    
                    // Buscar si el id del autor está en la lista de amigos
                    const idsAmigos = amigos.map(amigo => amigo.amigo?.id_user || amigo.id_user);
                    const esAmigo = idsAmigos.includes(autorId);
                    
                    return esAmigo;
                  }
                  return true;
                })
                .sort((a, b) => {
                  // Ordenar por fecha (más recientes primero)
                  if (activeTab === 'recientes') {
                    return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
                  }
                  // Ordenar dinámicamente por reacciones o comentarios según el sub-tab
                  if (activeTab === 'populares') {
                    if (popularSubTab === 'reacciones') {
                      return (b.reacciones_count || 0) - (a.reacciones_count || 0);
                    } else if (popularSubTab === 'comentarios') {
                      return (b.comentarios_count || 0) - (a.comentarios_count || 0);
                    }
                  }
                  return 0;
                });

              if (filteredPublicaciones.length === 0) {
                const messages = {
                  recientes: '📝 No hay publicaciones aún. ¡Sé el primero en publicar!',
                  populares: popularSubTab === 'reacciones' 
                    ? '❤️ No hay publicaciones con reacciones todavía. ¡Sé el primero en reaccionar!' 
                    : '💬 No hay publicaciones con comentarios todavía. ¡Sé el primero en comentar!',
                  amigos: '👥 No hay publicaciones de tus amigos aún. ¡Agrega amigos para ver su contenido!'
                };
                return (
                  <div style={{ textAlign: 'center', padding: '60px', gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                      {activeTab === 'amigos' ? '👥' : activeTab === 'populares' ? (popularSubTab === 'reacciones' ? '❤️' : '💬') : '📝'}
                    </div>
                    <p style={{ fontSize: '16px', color: theme.colors.textSecondary }}>
                      {messages[activeTab] || messages.recientes}
                    </p>
                  </div>
                );
              }

              return filteredPublicaciones
                .map((publicacion) => (
                  <div 
                    key={publicacion.id_publicacion} 
                    className="collection-card social-post" 
                    onClick={() => handleSelectPublicacion(publicacion)}
                    style={{ 
                      width: '100%',
                      background: `linear-gradient(145deg, ${theme.colors.primaryDark}30, ${theme.colors.primaryLight}20)`,
                      position: 'relative'
                    }}
                  >
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="user-info">
                      <div className="user-avatar">
                        <img 
                          src={publicacion.usuario?.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(publicacion.usuario?.nombre || 'U')}&background=random`} 
                          alt={publicacion.usuario?.nombre || 'Usuario'} 
                        />
                      </div>
                      <div>
                        <div className="user-name">{publicacion.usuario?.nombre || 'Usuario'} {publicacion.usuario?.apellido || ''}</div>
                        <div className="publication-date">
                          {new Date(publicacion.fecha_creacion).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Menú de opciones - solo para el dueño de la publicación */}
                    {user && publicacion.id_user === user.id_user && (
                      <div 
                        className="post-options-menu"
                        onClick={(e) => e.stopPropagation()}
                        style={{ position: 'relative' }}
                      >
                        <button
                          onClick={() => setOpenMenuId(openMenuId === publicacion.id_publicacion ? null : publicacion.id_publicacion)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            lineHeight: 1
                          }}
                          title="Opciones"
                        >
                          ⋮
                        </button>
                        
                        {openMenuId === publicacion.id_publicacion && (
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
                            minWidth: '140px'
                          }}>
                            <button
                              onClick={() => {
                                setEditingPostId(publicacion.id_publicacion);
                                setEditContent((publicacion.contenido || '').replace('[EVENTO]', ''));
                                setEditFiles([]);
                                const hasMedia = publicacion.media_urls && publicacion.media_urls.length > 0;
                                if (hasMedia) {
                                  const firstUrl = publicacion.media_urls[0];
                                  setEditFileType(getMediaType(firstUrl));
                                }
                                setOpenMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: 'transparent',
                                border: 'none',
                                color: theme.colors.text,
                                fontSize: '14px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = `${theme.colors.primary}20`}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => {
                                setDeletePostId(publicacion.id_publicacion);
                                setShowDeleteModal(true);
                                setOpenMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: 'transparent',
                                border: 'none',
                                color: theme.colors.notification,
                                fontSize: '14px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
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
                  
                  <div className="post-content">
                    {editingPostId === publicacion.id_publicacion ? (
                      <div onClick={(e) => e.stopPropagation()} style={{ padding: '12px 0' }}>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '12px',
                            fontSize: '15px',
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
                        {/* Botones de cambio de archivo */}
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '8px',
                          flexWrap: 'wrap'
                        }}>
                          <button
                            onClick={() => {
                              setEditFileType('imagen');
                              if (editFileInputRef.current) {
                                editFileInputRef.current.accept = 'image/*';
                                editFileInputRef.current.click();
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              background: theme.colors.cardBackground,
                              color: theme.colors.primary,
                              border: `1px solid ${theme.colors.primary}`,
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer'
                            }}
                          >
                            📷 Cambiar Imagen
                          </button>
                          <button
                            onClick={() => {
                              setEditFileType('documento');
                              if (editFileInputRef.current) {
                                editFileInputRef.current.accept = '.pdf,.doc,.docx,.txt';
                                editFileInputRef.current.click();
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              background: theme.colors.cardBackground,
                              color: theme.colors.primary,
                              border: `1px solid ${theme.colors.primary}`,
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer'
                            }}
                          >
                            📄 Cambiar Documento
                          </button>
                          {editFiles.length > 0 && (
                            <button
                              onClick={() => setEditFiles([])}
                              style={{
                                padding: '6px 12px',
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              ❌ Quitar archivo
                            </button>
                          )}
                        </div>
                        {editFiles.length > 0 && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px',
                            background: theme.colors.background,
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: theme.colors.textSecondary
                          }}>
                            ✅ Nuevo archivo: {editFiles[0].name}
                          </div>
                        )}
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '8px'
                        }}>
                          <button
                            onClick={() => handleEditPost(publicacion.id_publicacion)}
                            style={{
                              padding: '8px 20px',
                              background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => {
                              setEditingPostId(null);
                              setEditContent('');
                              setEditFiles([]);
                            }}
                            style={{
                              padding: '6px 20px',
                              background: theme.colors.textSecondary,
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>{(publicacion.contenido || '').replace('[EVENTO]', '')}</p>
                    )}
                    
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
                            { emoji: '😂', name: 'laugh' },
                            { emoji: '😮', name: 'wow' },
                            { emoji: '😢', name: 'sad' },
                            { emoji: '😠', name: 'angry' }
                          ].map((reaction, index) => (
                            <button
                              key={`${reaction.name}-${index}`}
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
              ));
            })()
          ) : (
            // Renderizar eventos cuando la pestaña activa es 'eventos'
            (() => {
              // Filtrar publicaciones que sean eventos (tienen prefijo [EVENTO])
              const eventosPublicaciones = publicaciones.filter(pub => 
                pub.contenido && pub.contenido.startsWith('[EVENTO]')
              );
              
              if (eventosPublicaciones.length === 0) {
                return (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px', 
                    gridColumn: '1 / -1',
                    background: `${theme.colors.cardBackground}40`,
                    borderRadius: '16px',
                    border: `2px dashed ${theme.colors.primaryLight}40`
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
                    <h3 style={{ fontSize: '20px', marginBottom: '12px', color: theme.colors.text }}>
                      No hay eventos programados
                    </h3>
                    <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '20px' }}>
                      {canCreateEvents() 
                        ? '¡Marca tu próxima publicación como evento para que aparezca aquí!' 
                        : 'Los eventos serán publicados por administradores y profesores.'}
                    </p>
                  </div>
                );
              }
              
              // Renderizar cada evento (publicación con prefijo [EVENTO])
              return eventosPublicaciones.map((publicacion) => {
                // Remover el prefijo [EVENTO] para mostrarlo limpio
                const contenidoLimpio = publicacion.contenido.replace('[EVENTO]', '').trim();
                
                return (
                  <div 
                    key={publicacion.id_publicacion} 
                    className="collection-card event-card" 
                    onClick={() => handleSelectPublicacion(publicacion)}
                    style={{ 
                      width: '100%',
                      background: `linear-gradient(145deg, ${theme.colors.primary}40, ${theme.colors.primaryLight}30)`,
                      border: `2px solid ${theme.colors.primary}60`
                    }}
                  >
                    <div className="event-card-header" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <div className="event-icon" style={{ fontSize: '32px' }}>📅</div>
                      <div className="event-badge" style={{
                        background: theme.colors.primary,
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>Evento</div>
                    </div>
                    
                    <div className="card-header">
                      <div className="user-info">
                        <div className="user-avatar">
                          <img 
                            src={publicacion.usuario?.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(publicacion.usuario?.nombre || 'U')}&background=random`} 
                            alt={publicacion.usuario?.nombre || 'Usuario'} 
                          />
                        </div>
                        <div>
                          <div className="user-name">{publicacion.usuario?.nombre || 'Usuario'} {publicacion.usuario?.apellido || ''}</div>
                          <div className="post-time">
                            {new Date(publicacion.fecha_creacion).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <p style={{ 
                        fontSize: '15px', 
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {contenidoLimpio}
                      </p>
                      
                      {publicacion.media && publicacion.media.length > 0 && (
                        <div style={{ 
                          marginTop: '12px',
                          display: 'grid',
                          gap: '8px',
                          gridTemplateColumns: publicacion.media.length === 1 ? '1fr' : 'repeat(2, 1fr)'
                        }}>
                          {publicacion.media.slice(0, 4).map((media, idx) => (
                            <div key={idx}>
                              {media.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                                <img 
                                  src={media.url} 
                                  alt={`Media ${idx + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                  }}
                                />
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReaccion(publicacion.id_publicacion);
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
                            borderRadius: '8px'
                          }}
                        >
                          👍 <span style={{ fontSize: '13px', fontWeight: '500' }}>{publicacion.reacciones_count || 0}</span>
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
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
                            borderRadius: '8px'
                          }}
                        >
                          💬 <span style={{ fontSize: '13px', fontWeight: '500' }}>{publicacion.comentarios_count || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              });
            })()
          )}
        </div>
      </div>
      
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
    </>
  );
};

export default SocialModule;