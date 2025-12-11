import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import amigosService from '../services/amigosService';
import '../styles/AmigosModule.css';

const UserProfileModule = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('amigos'); // publicaciones, amigos, fotos, actividad
  const [amigos, setAmigos] = useState([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([]);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar datos al montar el componente
  useEffect(() => {
    if (activeTab === 'amigos') {
      cargarDatos();
    }
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await amigosService.obtenerAmigos();
      setAmigos(data);
      
      // También cargar solicitudes para mostrar notificación
      const recibidas = await amigosService.obtenerSolicitudesRecibidas();
      const enviadas = await amigosService.obtenerSolicitudesEnviadas();
      setSolicitudesRecibidas(recibidas);
      setSolicitudesEnviadas(enviadas);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAceptarSolicitud = async (idRelacion) => {
    try {
      await amigosService.responderSolicitud(idRelacion, 'aceptar');
      cargarDatos();
    } catch (err) {
      console.error('Error al aceptar solicitud:', err);
      alert('Error al aceptar la solicitud');
    }
  };

  const handleRechazarSolicitud = async (idRelacion) => {
    try {
      await amigosService.responderSolicitud(idRelacion, 'rechazar');
      cargarDatos();
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      alert('Error al rechazar la solicitud');
    }
  };

  const handleEliminarAmigo = async (idRelacion) => {
    if (!window.confirm('¿Estás seguro de eliminar este amigo?')) return;
    
    try {
      await amigosService.eliminarAmigo(idRelacion);
      cargarDatos();
    } catch (err) {
      console.error('Error al eliminar amigo:', err);
      alert('Error al eliminar el amigo');
    }
  };

  const getUserInitials = (nombre, apellido) => {
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    return (n + a).toUpperCase() || '?';
  };

  const filteredAmigos = amigos.filter(amigo => 
    `${amigo.nombre} ${amigo.apellido}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="amigos-container">
      {/* Header con búsqueda */}
      <div className="amigos-header">
        <div className="camera-icon">📷</div>
        
        <div className="search-bar">
          <div className="search-icon">🔍</div>
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Perfil del usuario */}
      <div className="user-profile-section">
        <div className="user-avatar-large">
          {getUserInitials(user?.nombre, user?.apellido)}
        </div>
        
        <h2 className="user-name">
          {user?.nombre} {user?.apellido}
        </h2>
        
        <p className="user-email">{user?.correo}</p>
        
        <p className="user-info">
          {user?.rol === 'estudiante' ? 'administrador' : user?.rol} • {user?.carrera} • {user?.semestre}° semestre
        </p>
      </div>

      {/* Tabs de navegación */}
      <div className="amigos-tabs">
        <button 
          className={`amigos-tab ${activeTab === 'publicaciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('publicaciones')}
        >
          Publicaciones
        </button>
        <button 
          className={`amigos-tab ${activeTab === 'amigos' ? 'active' : ''}`}
          onClick={() => setActiveTab('amigos')}
        >
          Amigos
        </button>
        <button 
          className={`amigos-tab ${activeTab === 'fotos' ? 'active' : ''}`}
          onClick={() => setActiveTab('fotos')}
        >
          Fotos
        </button>
        <button 
          className={`amigos-tab ${activeTab === 'actividad' ? 'active' : ''}`}
          onClick={() => setActiveTab('actividad')}
        >
          Actividad
        </button>
      </div>

      {/* Contenido */}
      <div className="amigos-content">
        {activeTab === 'amigos' ? (
          loading ? (
            <div className="loading-state">Cargando...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : (
            <>
              {/* Botón para ver solicitudes */}
              {(solicitudesRecibidas.length > 0 || solicitudesEnviadas.length > 0) && (
                <button 
                  className="ver-solicitudes-btn"
                  onClick={() => setActiveTab('solicitudes')}
                >
                  Ver solicitudes pendientes ({solicitudesRecibidas.length})
                </button>
              )}

              {filteredAmigos.length === 0 ? (
                <div className="empty-state">
                  <p>No hay amigos para mostrar</p>
                </div>
              ) : (
                <div className="amigos-grid">
                  {filteredAmigos.map((amigo) => (
                    <div key={amigo.id_user} className="amigo-card">
                      <div className="amigo-avatar">
                        {amigo.foto_perfil ? (
                          <img src={amigo.foto_perfil} alt={amigo.nombre} />
                        ) : (
                          <div className="avatar-placeholder">
                            {getUserInitials(amigo.nombre, amigo.apellido)}
                          </div>
                        )}
                      </div>
                      <h3 className="amigo-nombre">
                        {amigo.nombre} {amigo.apellido}
                      </h3>
                      <p className="amigo-info">{amigo.carrera}</p>
                      <button 
                        className="eliminar-btn"
                        onClick={() => handleEliminarAmigo(amigo.id_relacion)}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )
        ) : activeTab === 'solicitudes' ? (
          <div className="solicitudes-container">
            <button 
              className="volver-btn"
              onClick={() => setActiveTab('amigos')}
            >
              ← Volver a amigos
            </button>

            {/* Solicitudes recibidas */}
            <div className="solicitudes-section">
              <h3>Solicitudes recibidas</h3>
              {solicitudesRecibidas.length === 0 ? (
                <p className="empty-message">No tienes solicitudes pendientes</p>
              ) : (
                <div className="solicitudes-list">
                  {solicitudesRecibidas.map((solicitud) => {
                    const usuario = solicitud.usuario1;
                    return (
                      <div key={solicitud.id_relacion_usuario} className="solicitud-card">
                        <div className="solicitud-avatar">
                          {usuario?.foto_perfil ? (
                            <img src={usuario.foto_perfil} alt={usuario.nombre} />
                          ) : (
                            <div className="avatar-placeholder">
                              {getUserInitials(usuario?.nombre, usuario?.apellido)}
                            </div>
                          )}
                        </div>
                        <div className="solicitud-info">
                          <h4>{usuario?.nombre} {usuario?.apellido}</h4>
                          <p>{usuario?.carrera}</p>
                        </div>
                        <div className="solicitud-actions">
                          <button 
                            className="aceptar-btn"
                            onClick={() => handleAceptarSolicitud(solicitud.id_relacion_usuario)}
                          >
                            Aceptar
                          </button>
                          <button 
                            className="rechazar-btn"
                            onClick={() => handleRechazarSolicitud(solicitud.id_relacion_usuario)}
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Solicitudes enviadas */}
            <div className="solicitudes-section">
              <h3>Solicitudes enviadas</h3>
              {solicitudesEnviadas.length === 0 ? (
                <p className="empty-message">No has enviado solicitudes</p>
              ) : (
                <div className="solicitudes-list">
                  {solicitudesEnviadas.map((solicitud) => {
                    const usuario = solicitud.usuario2;
                    return (
                      <div key={solicitud.id_relacion_usuario} className="solicitud-card">
                        <div className="solicitud-avatar">
                          {usuario?.foto_perfil ? (
                            <img src={usuario.foto_perfil} alt={usuario.nombre} />
                          ) : (
                            <div className="avatar-placeholder">
                              {getUserInitials(usuario?.nombre, usuario?.apellido)}
                            </div>
                          )}
                        </div>
                        <div className="solicitud-info">
                          <h4>{usuario?.nombre} {usuario?.apellido}</h4>
                          <p>{usuario?.carrera}</p>
                          <span className="solicitud-estado">Pendiente</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay {activeTab} para mostrar</p>
          </div>
        )}
      </div>

      {/* Botón flotante para agregar */}
      <button className="fab-button">
        <span>+</span>
      </button>

      {/* Botón inferior */}
      <div className="bottom-bar">
        <button className="menu-btn">☰</button>
        <button className="ok-btn">Ok</button>
      </div>
    </div>
  );
};

export default UserProfileModule;