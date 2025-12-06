import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import DetailPanel from './DetailPanel';
import carpoolingService from '../services/carpoolingService';
import { InteractiveRouteMap } from './CarpoolingComponents';
import '../styles/Carpooling.css';
import '../styles/CarpoolingEnhanced.css';

const CarpoolingModule = ({ onSelectItem, selectedItem }) => {
  const { theme } = useTheme();
  
  // Estados para las rutas y carga
  const [activeTab, setActiveTab] = useState('disponibles');
  const [rutas, setRutas] = useState([]);
  const [misRutas, setMisRutas] = useState({ como_conductor: [], como_pasajero: [] });
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [formData, setFormData] = useState({
    punto_inicio: '',
    punto_destino: '',
    hora_salida: '',
    dias_disponibles: '',
    capacidad_ruta: 1,
    paradas: []
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rutaToDelete, setRutaToDelete] = useState(null);
  const [editingRuta, setEditingRuta] = useState(null);
  const [showUbicacionModal, setShowUbicacionModal] = useState(false);
  const [rutaToJoin, setRutaToJoin] = useState(null);
  const [ubicacionRecogida, setUbicacionRecogida] = useState('');

  // Cerrar DetailPanel al cambiar de tab
  useEffect(() => {
    if (onSelectItem) {
      onSelectItem(null);
    }
  }, [activeTab, onSelectItem]);

  // Escuchar evento de actualización desde notificaciones
  useEffect(() => {
    const handleCarpoolingUpdate = () => {
      console.log('🔄 Recargando rutas por actualización desde notificaciones...');
      // Recargar las rutas según el tab activo
      if (activeTab === 'disponibles') {
        carpoolingService.getRutas()
          .then(res => setRutas(res.data))
          .catch(err => console.error('Error recargando rutas:', err));
      } else if (activeTab === 'mis-rutas') {
        carpoolingService.getMisRutas()
          .then(res => {
            const data = res.data || {};
            const conductorRutas = Array.isArray(data.como_conductor) 
              ? data.como_conductor.filter(r => 
                  r && r.id_ruta && r.punto_inicio && r.punto_destino &&
                  r.activa !== false && r.estado !== 'cancelada' && r.estado !== 'completada'
                ) 
              : [];
            const pasajeroRutas = Array.isArray(data.como_pasajero) 
              ? data.como_pasajero.filter(pr => 
                  pr && pr.ruta && pr.ruta.id_ruta &&
                  pr.estado !== 'cancelado' && pr.estado !== 'rechazado'
                ) 
              : [];
            setMisRutas({
              como_conductor: conductorRutas,
              como_pasajero: pasajeroRutas
            });
          })
          .catch(err => console.error('Error recargando mis rutas:', err));
      }
    };

    window.addEventListener('carpooling-updated', handleCarpoolingUpdate);
    
    return () => {
      window.removeEventListener('carpooling-updated', handleCarpoolingUpdate);
    };
  }, [activeTab]);

  // Cargar rutas disponibles desde la API
  useEffect(() => {
    setError(null);
    if (activeTab === 'disponibles') {
      setLoading(true);
      carpoolingService.getRutas()
        .then(res => {
          setRutas(res.data);
          setError(null);
        })
        .catch(err => {
          setError('Error al cargar rutas');
          setRutas([]);
        })
        .finally(() => setLoading(false));
    } else if (activeTab === 'mis-rutas') {
      setLoading(true);
      carpoolingService.getMisRutas()
        .then(res => {
          // Asegurarse de que los arrays existan y estén limpios
          const data = res.data || {};
          console.log('Mis Rutas - Respuesta completa:', data);
          console.log('Como conductor:', data.como_conductor);
          console.log('Como pasajero:', data.como_pasajero);
          
          // Filtrar solo rutas válidas (que tengan id_ruta, punto_inicio y estén activas)
          const conductorRutas = Array.isArray(data.como_conductor) 
            ? data.como_conductor.filter(r => 
                r && 
                r.id_ruta && 
                r.punto_inicio && 
                r.punto_destino &&
                r.activa !== false &&
                r.estado !== 'cancelada' &&
                r.estado !== 'completada'
              ) 
            : [];
          const pasajeroRutas = Array.isArray(data.como_pasajero) 
            ? data.como_pasajero.filter(pr => 
                pr && 
                pr.ruta && 
                pr.ruta.id_ruta &&
                pr.estado !== 'cancelado' &&
                pr.estado !== 'rechazado'
              ) 
            : [];
          
          console.log('Rutas conductor filtradas:', conductorRutas);
          console.log('Rutas pasajero filtradas:', pasajeroRutas);
          
          setMisRutas({
            como_conductor: conductorRutas,
            como_pasajero: pasajeroRutas
          });
          setError(null);
        })
        .catch(err => {
          setError('Error al cargar tus rutas');
          setMisRutas({ como_conductor: [], como_pasajero: [] });
        })
        .finally(() => setLoading(false));
    } else if (activeTab === 'historial') {
      setLoading(true);
      carpoolingService.getMisRutas()
        .then(res => {
          // Historial: rutas donde ya no eres pasajero ni conductor activo
          const historialRutas = [
            ...res.data.como_conductor.filter(r => !r.activa),
            ...res.data.como_pasajero.filter(r => r.estado === 'cancelado' || r.estado === 'rechazado')
          ];
          setHistorial(historialRutas);
          setError(null);
        })
        .catch(err => {
          setError('Error al cargar historial');
          setHistorial([]);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Manejador para seleccionar una ruta
  const handleSelectRuta = (ruta) => {
    // Generar una imagen de mapa más realista
    const mapImage = `https://via.placeholder.com/800x300/333333/FFFFFF?text=Ruta+${ruta.punto_inicio}+a+${ruta.punto_destino}`;
    // Adaptar datos según backend
    onSelectItem({
      ...ruta,
      userHandle: ruta.conductor?.nombre?.toLowerCase().replace(' ', '') || '',
      userName: ruta.conductor?.nombre || '',
      userAvatar: ruta.conductor?.foto_perfil || '',
      title: `${ruta.punto_inicio} → ${ruta.punto_destino}`,
      image: mapImage,
      price: `${ruta.pasajeros_aceptados ?? 0}/${ruta.capacidad_ruta}`,
      id: ruta.id_ruta || ruta.id,
      tipo: 'carpooling'
    });
  };

  // Función para determinar el estado de capacidad
  const getCapacidadStatus = (actual, total) => {
    if (actual >= total) return 'lleno';
    if (actual >= total * 0.7) return 'casi-lleno';
    return 'disponible';
  };

  // --- Formulario para crear ruta ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (locations) => {
    if (locations.origin) {
      setFormData(prev => ({ ...prev, punto_inicio: locations.origin.name }));
    }
    if (locations.destination) {
      setFormData(prev => ({ ...prev, punto_destino: locations.destination.name }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      // Validar que todos los campos requeridos estén presentes
      if (!formData.punto_inicio || !formData.punto_destino) {
        setFormError('Por favor selecciona el origen y destino en el mapa');
        setFormLoading(false);
        return;
      }
      
      if (!formData.hora_salida) {
        setFormError('Por favor ingresa la hora de salida');
        setFormLoading(false);
        return;
      }
      
      if (!formData.dias_disponibles) {
        setFormError('Por favor ingresa los días disponibles');
        setFormLoading(false);
        return;
      }
      
      // Adaptar hora_salida a formato HH:mm:ss si es necesario
      const data = { 
        ...formData, 
        hora_salida: formData.hora_salida.includes(':') ? formData.hora_salida + ':00' : formData.hora_salida 
      };
      
      console.log('Enviando datos de ruta:', data);
      await carpoolingService.createRuta(data);
      setShowForm(false);
      setShowMapSelector(false);
      setFormData({ punto_inicio: '', punto_destino: '', hora_salida: '', dias_disponibles: '', capacidad_ruta: 1, paradas: [] });
      setActiveTab('disponibles');
    } catch (err) {
      console.error('Error creando ruta:', err);
      let errorMessage = 'Error al crear la ruta';
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
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // --- Eliminar ruta ---
  const handleEliminarRuta = async (idRuta) => {
    setRutaToDelete(idRuta);
    setShowDeleteConfirm(true);
  };

  const confirmarEliminarRuta = async () => {
    if (!rutaToDelete) return;
    
    try {
      await carpoolingService.deleteRuta(rutaToDelete);
      // Recargar mis rutas
      const res = await carpoolingService.getMisRutas();
      const data = res.data || {};
      const conductorRutas = Array.isArray(data.como_conductor) 
        ? data.como_conductor.filter(r => 
            r && r.id_ruta && r.punto_inicio && r.punto_destino &&
            r.activa !== false && r.estado !== 'cancelada' && r.estado !== 'completada'
          ) 
        : [];
      const pasajeroRutas = Array.isArray(data.como_pasajero) 
        ? data.como_pasajero.filter(pr => 
            pr && pr.ruta && pr.ruta.id_ruta &&
            pr.estado !== 'cancelado' && pr.estado !== 'rechazado'
          ) 
        : [];
      setMisRutas({ como_conductor: conductorRutas, como_pasajero: pasajeroRutas });
      setShowDeleteConfirm(false);
      setRutaToDelete(null);
    } catch (err) {
      console.error('Error al eliminar ruta:', err);
      setFormError('Error al eliminar la ruta');
      setShowDeleteConfirm(false);
      setRutaToDelete(null);
    }
  };

  // --- Editar ruta ---
  const handleEditarRuta = (ruta) => {
    setEditingRuta(ruta);
    setFormData({
      punto_inicio: ruta.punto_inicio || '',
      punto_destino: ruta.punto_destino || '',
      hora_salida: ruta.hora_salida || '',
      dias_disponibles: ruta.dias_disponibles || '',
      capacidad_ruta: ruta.capacidad_ruta || 1,
      paradas: ruta.paradas || []
    });
    setShowForm(true);
  };

  const handleActualizarRuta = async () => {
    if (!editingRuta) return;
    
    try {
      setFormLoading(true);
      setFormError(null);
      
      const rutaActualizada = {
        ...formData,
        id_ruta: editingRuta.id_ruta
      };
      
      await carpoolingService.updateRuta(editingRuta.id_ruta, rutaActualizada);
      
      // Recargar mis rutas
      const res = await carpoolingService.getMisRutas();
      const data = res.data || {};
      const conductorRutas = Array.isArray(data.como_conductor) 
        ? data.como_conductor.filter(r => 
            r && r.id_ruta && r.punto_inicio && r.punto_destino &&
            r.activa !== false && r.estado !== 'cancelada' && r.estado !== 'completada'
          ) 
        : [];
      const pasajeroRutas = Array.isArray(data.como_pasajero) 
        ? data.como_pasajero.filter(pr => 
            pr && pr.ruta && pr.ruta.id_ruta &&
            pr.estado !== 'cancelado' && pr.estado !== 'rechazado'
          ) 
        : [];
      setMisRutas({ como_conductor: conductorRutas, como_pasajero: pasajeroRutas });
      
      // Limpiar formulario
      setShowForm(false);
      setEditingRuta(null);
      setFormData({
        punto_inicio: '',
        punto_destino: '',
        hora_salida: '',
        dias_disponibles: '',
        capacidad_ruta: 1,
        paradas: []
      });
    } catch (err) {
      console.error('Error actualizando ruta:', err);
      let errorMessage = 'Error al actualizar la ruta';
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
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // --- Unirse a ruta ---
  const handleUnirseRuta = async (ruta) => {
    // Abrir modal para solicitar ubicación de recogida
    setRutaToJoin(ruta);
    setUbicacionRecogida('');
    setShowUbicacionModal(true);
  };

  // --- Confirmar unión con ubicación ---
  const handleConfirmarUnion = async () => {
    try {
      const rutaId = rutaToJoin.id_ruta || rutaToJoin.id;
      console.log('Intentando unirse a la ruta:', rutaId, 'con ubicación:', ubicacionRecogida);
      
      // Preparar datos - solo incluir ubicacion_recogida si tiene valor
      const postData = {
        id_ruta: rutaId,
        estado: 'pendiente'
      };
      
      // Solo agregar ubicacion_recogida si el usuario ingresó algo
      if (ubicacionRecogida && ubicacionRecogida.trim()) {
        postData.ubicacion_recogida = ubicacionRecogida.trim();
      }
      
      const response = await carpoolingService.postularPasajero(postData);
      
      console.log('Respuesta exitosa:', response);
      setSuccessModal({ 
        show: true, 
        message: '¡Te has unido a la ruta exitosamente! Tu solicitud está pendiente de aprobación.' 
      });
      
      // Cerrar modal y limpiar
      setShowUbicacionModal(false);
      setRutaToJoin(null);
      setUbicacionRecogida('');
      
      // Recargar las rutas
      setActiveTab('mis-rutas');
    } catch (err) {
      console.error('Error al unirse a la ruta:', err);
      
      // Mostrar mensaje de error específico
      let errorMessage = 'Error al unirse a la ruta';
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = err.response.data?.detail || 'Ya estás postulado en esta ruta o no puedes unirte';
        } else if (err.response.status === 404) {
          errorMessage = 'Ruta no encontrada o inactiva';
        } else if (err.response.status === 401) {
          errorMessage = 'Debes iniciar sesión para unirte a una ruta';
        } else {
          errorMessage = err.response.data?.detail || 'Error al procesar la solicitud';
        }
      }
      
      setErrorModal({ show: true, message: errorMessage });
    }
  };

  // --- Renderizado principal ---
  return (
    <>
      <div className="collections-section">
        <div className="collections-header">
          <h2 className="collections-title">Carpooling Universitario</h2>
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Buscar rutas..." 
              className="search-input" 
            />
            <span className="search-icon">🔍</span>
          </div>
          <button 
            className="primary-button" 
            style={{ 
              background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
              borderRadius: '20px',
              padding: '8px 20px',
              fontWeight: '500'
            }}
            onClick={() => setShowForm(true)}
          >
            Crear Ruta
          </button>
        </div>

        <div className="tab-selector">
          <div 
            className={`tab-item ${activeTab === 'disponibles' ? 'active' : ''}`}
            onClick={() => setActiveTab('disponibles')}
          >
            Disponibles
          </div>
          <div 
            className={`tab-item ${activeTab === 'mis-rutas' ? 'active' : ''}`}
            onClick={() => setActiveTab('mis-rutas')}
          >
            Mis Rutas
          </div>
          <div 
            className={`tab-item ${activeTab === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveTab('historial')}
          >
            Historial
          </div>
        </div>

        {/* Formulario para crear/editar ruta - Diseño moderno tipo inDrive */}
        {showForm && (
          <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowForm(false)}>
            <div className="modal-content-carpooling">
              <button className="modal-close-btn" onClick={() => {
                setShowForm(false);
                setEditingRuta(null);
                setFormData({
                  punto_inicio: '',
                  punto_destino: '',
                  hora_salida: '',
                  dias_disponibles: '',
                  capacidad_ruta: 1,
                  paradas: []
                });
              }}>
                ✕
              </button>
              
              <div className="modal-header-carpooling">
                <div className="modal-icon">🚗</div>
                <h2>{editingRuta ? 'Editar Ruta' : 'Crear Nueva Ruta'}</h2>
                <p className="modal-subtitle">
                  {editingRuta ? 'Actualiza los detalles de tu ruta' : 'Comparte tu viaje y ayuda a otros estudiantes'}
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingRuta) {
                  handleActualizarRuta();
                } else {
                  handleFormSubmit(e);
                }
              }} className="carpool-form-modern">
                {/* Mapa interactivo para seleccionar origen y destino */}
                <div className="map-selector-container">
                  <InteractiveRouteMap 
                    onLocationSelect={handleLocationSelect}
                    initialOrigin={formData.punto_inicio ? { name: formData.punto_inicio } : null}
                    initialDestination={formData.punto_destino ? { name: formData.punto_destino } : null}
                  />
                </div>

                {/* Hora y Días */}
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-group-modern">
                      <label className="label-modern">
                        <span className="label-icon">🕐</span>
                        Hora de salida
                      </label>
                      <input 
                        name="hora_salida" 
                        value={formData.hora_salida} 
                        onChange={handleFormChange} 
                        type="time" 
                        className="input-modern"
                        required 
                      />
                    </div>

                    <div className="form-group-modern">
                      <label className="label-modern">
                        <span className="label-icon">👥</span>
                        Capacidad
                      </label>
                      <select 
                        name="capacidad_ruta" 
                        value={formData.capacidad_ruta} 
                        onChange={handleFormChange}
                        className="input-modern select-modern"
                        required
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'asiento' : 'asientos'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Días disponibles */}
                <div className="form-section">
                  <label className="label-modern">
                    <span className="label-icon">📅</span>
                    Días disponibles
                  </label>
                  <input 
                    name="dias_disponibles" 
                    value={formData.dias_disponibles} 
                    onChange={handleFormChange} 
                    placeholder="Lunes, Martes, Miércoles..." 
                    className="input-modern"
                    required 
                  />
                  <div className="help-text-modern">
                    💡 Ingresa los días separados por comas
                  </div>
                </div>

                {/* Información adicional */}
                <div className="info-box-modern">
                  <div className="info-icon">ℹ️</div>
                  <div className="info-content">
                    <strong>Recuerda:</strong> Al crear una ruta te comprometes a ser puntual y respetar las normas de seguridad vial. 
                  </div>
                </div>

                {formError && (
                  <div className="error-box-modern">
                    <span className="error-icon">⚠️</span>
                    {typeof formError === 'string' ? formError : 
                     Array.isArray(formError) ? formError.map((e, i) => (
                       <div key={i}>{typeof e === 'string' ? e : e.msg || JSON.stringify(e)}</div>
                     )) : 
                     formError.msg || formError.message || 'Error al procesar la solicitud'}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="form-actions-modern">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="btn-cancel-modern"
                    disabled={formLoading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit-modern"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <span className="spinner-modern"></span>
                        {editingRuta ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">{editingRuta ? '💾' : '✨'}</span>
                        {editingRuta ? 'Actualizar Ruta' : 'Crear Ruta'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grilla de rutas según pestaña */}
        <div className="collections-grid carpooling-grid">
          {loading && <div className="loading">Cargando rutas...</div>}
          {error && <div className="error">{error}</div>}

          {/* Disponibles */}
          {!loading && !error && activeTab === 'disponibles' && rutas.length === 0 && (
            <div className="no-results">No hay rutas disponibles.</div>
          )}
          {!loading && !error && activeTab === 'disponibles' && rutas.map((ruta) => {
            const capacidadStatus = getCapacidadStatus(ruta.pasajeros_aceptados ?? 0, ruta.capacidad_ruta);
            const conductor = ruta.usuario || ruta.conductor || {};
            const conductorNombre = conductor.nombre || 'Conductor';
            const conductorApellido = conductor.apellido || '';
            const nombreCompleto = conductorApellido ? `${conductorNombre} ${conductorApellido}` : conductorNombre;
            const initials = nombreCompleto
              ? nombreCompleto.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 2)
              : '?';
            
            return (
              <div key={ruta.id_ruta || ruta.id} className="route-card">
                <div className="route-header">
                  <h3 className="route-title">
                    {nombreCompleto}
                  </h3>
                  <div className={`route-status ${capacidadStatus === 'disponible' ? 'status-available' : 'status-full'}`}>
                    {ruta.pasajeros_aceptados ?? 0}/{ruta.capacidad_ruta}
                  </div>
                </div>
                
                <div className="route-content">
                  <div className="route-driver">
                    <div className="driver-avatar">
                      {conductor.foto_perfil ? (
                        <img src={conductor.foto_perfil} alt={nombreCompleto} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="driver-info">
                      <div className="driver-name">{nombreCompleto}</div>
                      <div className="driver-role">Conductor</div>
                    </div>
                  </div>

                  <div className="route-path">
                    <div className="path-origin">
                      <div className="path-location">{ruta.punto_inicio}</div>
                      <div className="path-type">Origen</div>
                    </div>
                    <div className="path-arrow">→</div>
                    <div className="path-destination">
                      <div className="path-location">{ruta.punto_destino}</div>
                      <div className="path-type">Destino</div>
                    </div>
                  </div>

                  <div className="route-details">
                    <div className="detail-item">
                      <div className="detail-icon">⏰</div>
                      <div className="detail-text">{ruta.hora_salida || 'Hora no especificada'}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">📅</div>
                      <div className="detail-text">{ruta.dias_disponibles || 'Días no especificados'}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-icon">📍</div>
                      <div className="detail-text">{ruta.paradas ? ruta.paradas.length : 0} paradas</div>
                    </div>
                  </div>

                  <div className="capacity-info">
                    <span className="capacity-text">Capacidad</span>
                    <div className="capacity-indicator">
                      {Array.from({length: ruta.capacidad_ruta}).map((_, index) => (
                        <div 
                          key={index} 
                          className={`capacity-dot ${index < (ruta.pasajeros_aceptados ?? 0) ? 'filled' : ''}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="route-datetime">
                    <div className="datetime-section">
                      <div className="datetime-label">Creada</div>
                      <div className="datetime-value">
                        {ruta.fecha_creacion 
                          ? new Date(ruta.fecha_creacion).toLocaleDateString('es-ES') 
                          : '24/10/2025'}
                      </div>
                    </div>
                  </div>

                  <div className="route-actions">
                    <button 
                      className="join-button" 
                      onClick={() => handleUnirseRuta(ruta)}
                      disabled={capacidadStatus === 'lleno'}
                    >
                      {capacidadStatus === 'lleno' ? 'Completo' : 'Unirse'}
                    </button>
                    <button 
                      className="more-info-button" 
                      onClick={() => handleSelectRuta(ruta)}
                      title="Ver más información"
                    >
                      ℹ️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Mis Rutas */}
          {!loading && !error && activeTab === 'mis-rutas' && (
            <>
              {/* Mostrar empty state GENERAL solo si AMBOS arrays están vacíos */}
              {misRutas.como_conductor.length === 0 && misRutas.como_pasajero.length === 0 ? (
                <div className="empty-state-card" style={{gridColumn: '1 / -1'}}>
                  <div className="empty-state-icon">🚗</div>
                  <h3 className="empty-state-title">No tienes rutas creadas</h3>
                  <p className="empty-state-text">Crea tu primera ruta y comienza a compartir viajes con otros estudiantes</p>
                  <button className="empty-state-button" onClick={() => setShowForm(true)}>
                    <span>+</span> Crear primera ruta
                  </button>
                </div>
              ) : (
                <>
                  {/* Sección Como Conductor - Solo mostrar si hay rutas o si como_pasajero tiene datos */}
                  {(misRutas.como_conductor.length > 0 || misRutas.como_pasajero.length > 0) && (
                    <>
                      <div style={{gridColumn: '1 / -1', marginTop: '20px', marginBottom: '10px'}}>
                        <h3 style={{color: 'var(--primary-color)', fontSize: '1.3rem', fontWeight: '700'}}>Como conductor</h3>
                      </div>
                      {misRutas.como_conductor.length === 0 ? (
                        <div className="empty-state-card" style={{gridColumn: '1 / -1'}}>
                          <div className="empty-state-icon">🚗</div>
                          <h3 className="empty-state-title">No tienes rutas creadas</h3>
                          <p className="empty-state-text">Crea tu primera ruta y comienza a compartir viajes</p>
                          <button className="empty-state-button" onClick={() => setShowForm(true)}>
                            <span>+</span> Crear primera ruta
                          </button>
                        </div>
                      ) : (
                misRutas.como_conductor.map((ruta) => {
                const capacidadStatus = getCapacidadStatus(ruta.pasajeros_aceptados ?? 0, ruta.capacidad_ruta);
                const conductor = ruta.usuario || ruta.conductor || {};
                const conductorNombre = conductor.nombre || 'Conductor';
                const conductorApellido = conductor.apellido || '';
                const nombreCompleto = conductorApellido ? `${conductorNombre} ${conductorApellido}` : conductorNombre;
                const initials = nombreCompleto
                  ? nombreCompleto.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 2)
                  : '?';
                
                return (
                  <div key={ruta.id_ruta || ruta.id} className="route-card">
                    <div className="route-header">
                      <h3 className="route-title">{nombreCompleto}</h3>
                      <div className={`route-status ${capacidadStatus === 'disponible' ? 'status-available' : 'status-full'}`}>
                        {ruta.pasajeros_aceptados ?? 0}/{ruta.capacidad_ruta}
                      </div>
                    </div>
                    
                    <div className="route-content">
                      <div className="route-driver">
                        <div className="driver-avatar">
                          {conductor.foto_perfil ? (
                            <img src={conductor.foto_perfil} alt={nombreCompleto} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <div className="driver-info">
                          <div className="driver-name">{nombreCompleto}</div>
                          <div className="driver-role">Conductor</div>
                        </div>
                      </div>

                      <div className="route-path">
                        <div className="path-origin">
                          <div className="path-location">{ruta.punto_inicio}</div>
                          <div className="path-type">Origen</div>
                        </div>
                        <div className="path-arrow">→</div>
                        <div className="path-destination">
                          <div className="path-location">{ruta.punto_destino}</div>
                          <div className="path-type">Destino</div>
                        </div>
                      </div>

                      <div className="route-details">
                        <div className="detail-item">
                          <div className="detail-icon">⏰</div>
                          <div className="detail-text">{ruta.hora_salida || 'Hora no especificada'}</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-icon">📅</div>
                          <div className="detail-text">{ruta.dias_disponibles || 'Días no especificados'}</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-icon">📍</div>
                          <div className="detail-text">{ruta.paradas ? ruta.paradas.length : 0} paradas</div>
                        </div>
                      </div>

                      <div className="capacity-info">
                        <span className="capacity-text">Capacidad</span>
                        <div className="capacity-indicator">
                          {Array.from({length: ruta.capacidad_ruta}).map((_, index) => (
                            <div 
                              key={index} 
                              className={`capacity-dot ${index < (ruta.pasajeros_aceptados ?? 0) ? 'filled' : ''}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="route-datetime">
                        <div className="datetime-section">
                          <div className="datetime-label">Creada</div>
                          <div className="datetime-value">
                            {ruta.fecha_creacion 
                              ? new Date(ruta.fecha_creacion).toLocaleDateString('es-ES') 
                              : '24/10/2025'}
                          </div>
                        </div>
                      </div>

                      <div className="route-actions">
                        <button 
                          className="join-button" 
                          onClick={() => handleSelectRuta(ruta)}
                          style={{flex: 1}}
                        >
                          Ver Detalles
                        </button>
                        <button 
                          onClick={() => handleEditarRuta(ruta)}
                          style={{
                            background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginLeft: '10px'
                          }}
                          title="Editar ruta"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleEliminarRuta(ruta.id_ruta)}
                          style={{
                            background: 'linear-gradient(135deg, #dc3545, #c82333)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginLeft: '10px'
                          }}
                          title="Eliminar ruta"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }))}
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Historial */}
          {!loading && !error && activeTab === 'historial' && (
            <>
              {historial.length === 0 && (
                <div style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '400px'
                }}>
                  <div style={{
                    background: '#2c2c3e',
                    borderRadius: '16px',
                    padding: '48px 64px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    maxWidth: '500px',
                    width: '100%'
                  }}>
                    <div style={{
                      fontSize: '64px',
                      marginBottom: '24px',
                      opacity: 0.6
                    }}>
                      📜
                    </div>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      marginBottom: '12px',
                      color: 'white'
                    }}>
                      No hay historial
                    </h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      margin: 0
                    }}>
                      Aquí aparecerán las rutas completadas y tu historial de viajes
                    </p>
                  </div>
                </div>
              )}
              {historial.map((ruta, idx) => {
                const capacidadStatus = getCapacidadStatus(ruta.pasajeros_aceptados ?? 0, ruta.capacidad_ruta);
                const conductor = ruta.usuario || ruta.conductor || {};
                const conductorNombre = conductor.nombre || 'Conductor';
                const conductorApellido = conductor.apellido || '';
                const nombreCompleto = conductorApellido ? `${conductorNombre} ${conductorApellido}` : conductorNombre;
                const initials = nombreCompleto
                  ? nombreCompleto.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 2)
                  : '?';
                
                return (
                  <div key={ruta.id_ruta || ruta.id || idx} className="route-card" style={{opacity: 0.85}}>
                    <div className="route-header" style={{
                      background: 'linear-gradient(135deg, rgba(100, 100, 100, 0.9) 0%, rgba(80, 80, 80, 0.8) 100%)'
                    }}>
                      <h3 className="route-title">{nombreCompleto}</h3>
                      <div className="route-status" style={{
                        background: 'rgba(158, 158, 158, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        Finalizada
                      </div>
                    </div>
                    
                    <div className="route-content">
                      <div className="route-driver">
                        <div className="driver-avatar" style={{
                          filter: 'grayscale(50%)'
                        }}>
                          {conductor.foto_perfil ? (
                            <img src={conductor.foto_perfil} alt={nombreCompleto} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <div className="driver-info">
                          <div className="driver-name">{nombreCompleto}</div>
                          <div className="driver-role">Conductor</div>
                        </div>
                      </div>

                      <div className="route-path">
                        <div className="path-origin">
                          <div className="path-location">{ruta.punto_inicio || 'N/A'}</div>
                          <div className="path-type">Origen</div>
                        </div>
                        <div className="path-arrow">→</div>
                        <div className="path-destination">
                          <div className="path-location">{ruta.punto_destino || 'N/A'}</div>
                          <div className="path-type">Destino</div>
                        </div>
                      </div>

                      <div className="route-details">
                        <div className="detail-item">
                          <div className="detail-icon">⏰</div>
                          <div className="detail-text">{ruta.hora_salida || 'Hora no especificada'}</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-icon">📅</div>
                          <div className="detail-text">{ruta.dias_disponibles || 'Días no especificados'}</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-icon">📍</div>
                          <div className="detail-text">{ruta.paradas ? ruta.paradas.length : 0} paradas</div>
                        </div>
                      </div>

                      <div className="capacity-info">
                        <span className="capacity-text">Capacidad</span>
                        <div className="capacity-indicator">
                          {Array.from({length: ruta.capacidad_ruta || 4}).map((_, index) => (
                            <div 
                              key={index} 
                              className={`capacity-dot ${index < (ruta.pasajeros_aceptados ?? 0) ? 'filled' : ''}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="route-datetime">
                        <div className="datetime-section">
                          <div className="datetime-label">Fecha</div>
                          <div className="datetime-value">
                            {ruta.fecha_creacion 
                              ? new Date(ruta.fecha_creacion).toLocaleDateString('es-ES') 
                              : 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="route-actions">
                        <button 
                          className="join-button" 
                          onClick={() => handleSelectRuta(ruta)}
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, rgba(100, 100, 100, 0.8), rgba(120, 120, 120, 0.8))'
                          }}
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {selectedItem && <DetailPanel item={selectedItem} onClose={() => onSelectItem(null)} />}
      
      {/* Modal de confirmación para eliminar ruta */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2a2a3e 0%, #1f1f2e 100%)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              fontSize: '48px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              ⚠️
            </div>
            <h3 style={{
              color: 'white',
              fontSize: '1.4rem',
              fontWeight: '700',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              ¿Eliminar esta ruta?
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.95rem',
              marginBottom: '28px',
              textAlign: 'center',
              lineHeight: '1.6'
            }}>
              Esta acción no se puede deshacer. La ruta será eliminada permanentemente.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRutaToDelete(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminarRuta}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #dc3545, #c82333)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {successModal.show && (
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
            }}>✅</div>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '24px',
              color: theme.colors.text,
              fontWeight: '600',
              textAlign: 'center'
            }}>
              ¡Éxito!
            </h3>
            <p style={{
              margin: '0 0 25px 0',
              fontSize: '16px',
              color: theme.colors.textSecondary,
              lineHeight: '1.5',
              textAlign: 'center'
            }}>
              {successModal.message}
            </p>
            <button
              onClick={() => setSuccessModal({ show: false, message: '' })}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: theme.colors.primary,
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

      {/* Modal de error */}
      {errorModal.show && (
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
            }}>❌</div>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '24px',
              color: theme.colors.text,
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Error
            </h3>
            <p style={{
              margin: '0 0 25px 0',
              fontSize: '16px',
              color: theme.colors.textSecondary,
              lineHeight: '1.5',
              textAlign: 'center'
            }}>
              {errorModal.message}
            </p>
            <button
              onClick={() => setErrorModal({ show: false, message: '' })}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: '#dc3545',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Ubicación de Recogida */}
      {showUbicacionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            backgroundColor: theme.colors.background,
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            <div style={{
              fontSize: '48px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>📍</div>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '24px',
              color: theme.colors.text,
              fontWeight: '600',
              textAlign: 'center'
            }}>
              ¿Dónde te recogemos?
            </h3>
            <p style={{
              margin: '0 0 25px 0',
              fontSize: '16px',
              color: theme.colors.textSecondary,
              lineHeight: '1.5',
              textAlign: 'center'
            }}>
              Opcionalmente, ingresa tu ubicación para que el conductor sepa dónde recogerte
            </p>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.colors.text
              }}>
                Ubicación de recogida (opcional)
              </label>
              <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={ubicacionRecogida}
                  onChange={(e) => setUbicacionRecogida(e.target.value)}
                  placeholder="Ej: Plaza principal, Av. Cristo Redentor, etc."
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: theme.colors.surface,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: theme.colors.text,
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.colors.border}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      setUbicacionRecogida('📍 Obteniendo ubicación...');
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const lat = position.coords.latitude;
                          const lng = position.coords.longitude;
                          // Usar servicio de geocodificación inversa (Nominatim - OpenStreetMap)
                          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
                            .then(res => res.json())
                            .then(data => {
                              const address = data.display_name || `${lat}, ${lng}`;
                              const shortAddress = data.address ? 
                                `${data.address.road || ''} ${data.address.house_number || ''}, ${data.address.neighbourhood || data.address.suburb || ''}`.trim() 
                                : address;
                              setUbicacionRecogida(shortAddress || address);
                            })
                            .catch(() => {
                              setUbicacionRecogida(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
                            });
                        },
                        (error) => {
                          setUbicacionRecogida('');
                          setErrorModal({ show: true, message: 'No se pudo obtener tu ubicación. Verifica los permisos del navegador.' });
                        }
                      );
                    } else {
                      setErrorModal({ show: true, message: 'Tu navegador no soporta geolocalización' });
                    }
                  }}
                  style={{
                    padding: '12px',
                    backgroundColor: theme.colors.primary,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '48px',
                    height: '48px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                  title="Usar mi ubicación actual"
                >
                  📍
                </button>
              </div>
              <small style={{
                display: 'block',
                marginTop: '6px',
                fontSize: '12px',
                color: theme.colors.textSecondary,
                fontStyle: 'italic'
              }}>
                💡 Haz clic en 📍 para usar tu ubicación actual (opcional)
              </small>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowUbicacionModal(false);
                  setRutaToJoin(null);
                  setUbicacionRecogida('');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  border: `2px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = theme.colors.border}
                onMouseOut={(e) => e.target.style.backgroundColor = theme.colors.surface}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarUnion}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.colors.primary,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Confirmar Postulación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarpoolingModule;