import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import '../styles/Carpooling.css';
import '../styles/CustomComponents.css';

// Componente para mostrar una tarjeta de ruta de carpooling con estilo moderno
export const RouteCard = ({ route, onJoin, onViewMap }) => {
  const { theme } = useTheme();
  
  const isAvailable = route.occupiedSeats < route.capacity;
  
  return (
    <div className="route-card">
      <div className="route-header" style={{ 
        background: theme.colors.primaryGradient || `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`
      }}>
        <h3 className="route-title">
          {route.origin} → {route.destination}
        </h3>
        <span className={`route-status ${isAvailable ? 'status-available' : 'status-full'}`}>
          {isAvailable ? 'Disponible' : 'Completo'}
        </span>
      </div>
      <div className="route-content">
        <div className="route-driver">
          <div className="driver-avatar">
            {route.driver ? route.driver.charAt(0) : 'U'}
          </div>
          <div className="driver-info">
            <p className="driver-name" style={{ color: theme.colors.text }}>{route.driver || 'Usuario'}</p>
            <span className="driver-role" style={{ color: theme.colors.textLight }}>Conductor</span>
          </div>
        </div>
        <div className="route-details">
          <div className="detail-item">
            <span className="detail-icon" style={{ color: theme.colors.primary }}>🕒</span>
            <span className="detail-text" style={{ color: theme.colors.text }}>Hora de salida: {route.time}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon" style={{ color: theme.colors.primary }}>📍</span>
            <span className="detail-text" style={{ color: theme.colors.text }}>Origen: {route.origin}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon" style={{ color: theme.colors.primary }}>🎯</span>
            <span className="detail-text" style={{ color: theme.colors.text }}>Destino: {route.destination}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon" style={{ color: theme.colors.primary }}>👤</span>
            <span className="detail-text" style={{ color: theme.colors.text }}>
              {route.occupiedSeats} / {route.capacity} asientos ocupados
            </span>
          </div>
          
          <div className="route-schedule" style={{ backgroundColor: `${theme.colors.cardBgSecondary || '#f5f5f5'}` }}>
            <p className="schedule-title" style={{ color: theme.colors.primary }}>Días disponibles:</p>
            <p className="schedule-days" style={{ color: theme.colors.text }}>
              {route.days ? route.days.join(', ') : 'No especificados'}
            </p>
          </div>

          {route.stops && route.stops.length > 0 && (
            <div className="route-stops">
              <h4 className="stops-title" style={{ color: theme.colors.primary }}>Paradas</h4>
              
              {route.stops.map((stop, index) => (
                <div key={index} className="stop-item" style={{ 
                  backgroundColor: index % 2 === 0 ? `${theme.colors.primary}10` : 'transparent' 
                }}>
                  <span className="stop-name" style={{ color: theme.colors.text }}>{stop.name}</span>
                  <span className="stop-time" style={{ color: theme.colors.secondaryText }}>{stop.time}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="route-actions">
            <button 
              className="join-button" 
              onClick={() => onJoin && onJoin(route.id)}
              style={{ backgroundColor: theme.colors.primary }}
              disabled={!isAvailable}
            >
              {isAvailable ? 'Unirse a esta ruta' : 'Ruta completa'}
            </button>
            <button 
              className="more-info-button" 
              onClick={() => onViewMap && onViewMap(route.id)}
              style={{ color: theme.colors.secondaryText, borderColor: theme.colors.border }}
            >
              <span role="img" aria-label="Ver mapa">🗺️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para crear una nueva ruta
export const CreateRouteForm = ({ onSubmit, onCancel }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    origin: '',
    destination: 'Campus Universidad',
    time: '',
    days: [],
    capacity: 4
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleDayToggle = (day) => {
    const updatedDays = formData.days.includes(day)
      ? formData.days.filter(d => d !== day)
      : [...formData.days, day];
    
    setFormData({
      ...formData,
      days: updatedDays
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };
  
  return (
    <div className="create-route-form">
      <h3 style={{ 
        color: theme.colors.primary, 
        marginBottom: '25px',
        fontSize: '1.2rem',
        fontWeight: '600',
        letterSpacing: '-0.3px',
        position: 'relative',
        paddingBottom: '10px'
      }}>
        <span style={{ 
          position: 'relative',
          zIndex: 1
        }}>Crear Nueva Ruta</span>
        <span style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '40px',
          height: '3px',
          backgroundColor: theme.colors.primary,
          borderRadius: '2px'
        }}></span>
      </h3>
      
      <div className="form-group">
        <label className="input-label">
          Origen
        </label>
        <input 
          type="text" 
          name="origin"
          value={formData.origin}
          onChange={handleChange}
          placeholder="¿Desde dónde sales?"
          className="custom-input"
        />
        <div className="help-text">Ingresa la dirección desde donde saldrás</div>
      </div>
      
      <div className="form-group">
        <label className="input-label">
          Destino
        </label>
        <input 
          type="text" 
          name="destination"
          value={formData.destination}
          disabled
          className="custom-input"
          style={{ opacity: 0.7 }}
        />
        <div className="help-text">El destino está configurado por defecto</div>
      </div>
      
      <div className="form-group">
        <label className="input-label">
          <span style={{ fontSize: '1rem', fontWeight: '600' }}>⏰</span> Horario de salida
        </label>
        <div className="time-picker-modern">
          <div className="time-display">
            <input 
              type="time" 
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="time-input-hidden"
            />
            <div className="time-visual">
              <div className="time-segment">
                <span className="time-value">{formData.time ? formData.time.split(':')[0] : '00'}</span>
                <span className="time-label">Hora</span>
              </div>
              <span className="time-separator">:</span>
              <div className="time-segment">
                <span className="time-value">{formData.time ? formData.time.split(':')[1] : '00'}</span>
                <span className="time-label">Min</span>
              </div>
              <div className="time-period">
                <span className="period-badge">
                  {formData.time && parseInt(formData.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="help-text">🕐 Toca para seleccionar la hora de salida</div>
      </div>
      
      <div className="form-group">
        <label className="input-label">
          Días disponibles
        </label>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '10px', 
          marginTop: '10px', 
          marginBottom: '5px' 
        }}>
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              style={{
                padding: '8px 16px',
                borderRadius: '18px',
                border: `1px solid ${formData.days.includes(day) ? 'transparent' : 'rgba(255, 255, 255, 0.15)'}`,
                background: formData.days.includes(day) 
                  ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight})` 
                  : 'rgba(255, 255, 255, 0.05)',
                color: formData.days.includes(day) ? 'white' : theme.colors.text,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: formData.days.includes(day) 
                  ? '0 4px 10px rgba(139, 30, 65, 0.3)'
                  : 'none',
                fontWeight: formData.days.includes(day) ? '600' : '400',
              }}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="help-text">Selecciona los días en que ofrecerás este viaje</div>
      </div>
      
      <div className="form-group">
        <label className="input-label">
          Capacidad de asientos
        </label>
        <select 
          name="capacity" 
          value={formData.capacity}
          onChange={handleChange}
          className="custom-select"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
            <option key={num} value={num}>{num} {num === 1 ? 'asiento' : 'asientos'}</option>
          ))}
        </select>
        <div className="help-text">Número de asientos disponibles en tu vehículo</div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '30px',
        gap: '15px'
      }}>
        <button 
          onClick={onCancel}
          className="button-secondary"
        >
          <span role="img" aria-label="cancelar" style={{ marginRight: '5px' }}>✖️</span>
          Cancelar
        </button>
        <button 
          onClick={handleSubmit}
          className="join-button"
          style={{ padding: '12px 25px' }}
        >
          <span role="img" aria-label="crear" style={{ marginRight: '5px' }}>✅</span>
          Crear ruta
        </button>
      </div>
      
      <div className="tooltip" style={{ position: 'absolute', right: '20px', bottom: '20px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>?</span>
        <span className="tooltip-text">
          Al crear una ruta, estás ofreciendo llevar a otros estudiantes a la universidad.
          Recuerda ser puntual y respetar las normas de tránsito.
        </span>
      </div>
    </div>
  );
};

// Componente para mostrar las rutas en un mapa
export const RoutesMap = ({ routes }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: theme.colors.card,
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{ color: theme.colors.primary, marginBottom: '20px' }}>
        Mapa de rutas
      </h3>
      
      <div style={{
        height: '400px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: theme.colors.secondaryText }}>
          Visualización de mapa próximamente
        </p>
      </div>
    </div>
  );
};

// Componente para mostrar mis rutas como conductor
export const MyRoutesAsDriver = ({ routes, onEdit, onCancel }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: theme.colors.card,
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{ color: theme.colors.primary, marginBottom: '20px' }}>
        Mis rutas como conductor
      </h3>
      
      {routes && routes.length > 0 ? (
        <div>
          {routes.map((route, index) => (
            <div key={index} style={{
              padding: '15px',
              borderBottom: `1px solid ${theme.colors.border}`,
              marginBottom: '10px',
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}>
                <h4 style={{ color: theme.colors.text, margin: 0 }}>
                  {route.origin} → {route.destination}
                </h4>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: theme.colors.success + '30',
                  color: theme.colors.success,
                  borderRadius: '4px',
                  fontSize: '12px',
                }}>
                  Activa
                </span>
              </div>
              
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '5px'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold', marginRight: '5px' }}>Horario:</span>
                  <span>{route.time}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold', marginRight: '5px' }}>Ocupación:</span>
                  <span>{route.occupiedSeats}/{route.capacity}</span>
                </div>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', marginRight: '5px' }}>Días:</span>
                <span>{route.days.join(', ')}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button 
                  onClick={() => onEdit && onEdit(route.id)}
                  style={{
                    backgroundColor: theme.colors.warning,
                    color: 'white',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Editar ruta
                </button>
                <button 
                  onClick={() => onCancel && onCancel(route.id)}
                  style={{
                    backgroundColor: theme.colors.error,
                    color: 'white',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar ruta
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: theme.colors.secondaryText, textAlign: 'center' }}>
          No tienes rutas activas como conductor.
        </p>
      )}
    </div>
  );
};

// Componente de Mapa Interactivo con Google Maps Real
export const InteractiveRouteMap = ({ onLocationSelect, initialOrigin, initialDestination }) => {
  const { theme } = useTheme();
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [activeMarker, setActiveMarker] = useState('origin'); // 'origin' o 'destination'
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  // Referencias para Google Maps
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const originMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  // Lugares predefinidos de Sucre, Bolivia
  const cochabambaLocations = [
    // Universidad y zonas académicas
    { name: 'Campus Las Delicias (Univalle)', coords: { lat: -19.018, lng: -65.258 }, zone: 'Norte' },
    { name: 'Universidad San Francisco Xavier', coords: { lat: -19.042, lng: -65.259 }, zone: 'Centro' },
    
    // Centro histórico
    { name: 'Plaza 25 de Mayo', coords: { lat: -19.047, lng: -65.259 }, zone: 'Centro' },
    { name: 'Catedral de Sucre', coords: { lat: -19.048, lng: -65.260 }, zone: 'Centro' },
    { name: 'Casa de la Libertad', coords: { lat: -19.047, lng: -65.259 }, zone: 'Centro' },
    
    // Zonas residenciales y comerciales
    { name: 'Terminal de Buses', coords: { lat: -19.035, lng: -65.273 }, zone: 'Norte' },
    { name: 'Mercado Central', coords: { lat: -19.045, lng: -65.261 }, zone: 'Centro' },
    { name: 'Parque Bolívar', coords: { lat: -19.046, lng: -65.257 }, zone: 'Centro' },
    { name: 'Zona Petrolera', coords: { lat: -19.035, lng: -65.250 }, zone: 'Norte' },
    { name: 'El Guereo', coords: { lat: -19.020, lng: -65.265 }, zone: 'Norte' },
    
    // Zonas periféricas
    { name: 'Villa Armonía', coords: { lat: -19.055, lng: -65.268 }, zone: 'Sud' },
    { name: 'Senac', coords: { lat: -19.038, lng: -65.243 }, zone: 'Este' },
    { name: 'Aeropuerto Juana Azurduy', coords: { lat: -19.007, lng: -65.289 }, zone: 'Norte' },
    { name: 'Hospital Santa Bárbara', coords: { lat: -19.043, lng: -65.255 }, zone: 'Centro' },
    { name: 'Avenida del Maestro', coords: { lat: -19.040, lng: -65.264 }, zone: 'Centro' },
    
    // Zonas educativas adicionales
    { name: 'Garcilazo', coords: { lat: -19.050, lng: -65.270 }, zone: 'Sud' },
    { name: 'Av. Las Américas (Sucre)', coords: { lat: -19.030, lng: -65.260 }, zone: 'Norte' },
    { name: 'Recoleta', coords: { lat: -19.053, lng: -65.258 }, zone: 'Centro' }
  ];

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 1) {
      const filtered = cochabambaLocations.filter(loc => 
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        loc.zone.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Inicializar Leaflet Map (OpenStreetMap - Gratuito)
  useEffect(() => {
    if (!mapRef.current || googleMapRef.current || !window.L) return;

    // Pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      try {
        // Crear el mapa con Leaflet centrado en Sucre, Bolivia
        const map = window.L.map(mapRef.current).setView([-19.0425, -65.2597], 13);

        // Agregar capa de OpenStreetMap
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        googleMapRef.current = map;

    // Icono personalizado para marcadores
    const defaultIcon = window.L.divIcon({
      className: 'custom-marker',
      html: '<div style="background: #8B1E41; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Agregar marcadores para cada ubicación
    cochabambaLocations.forEach(location => {
      const marker = window.L.marker([location.coords.lat, location.coords.lng], {
        icon: defaultIcon,
        title: location.name
      }).addTo(map);

      // Popup al hacer clic
      const popupContent = `
        <div style="font-family: Arial, sans-serif; min-width: 180px;">
          <h4 style="margin: 0 0 8px 0; color: #8B1E41; font-size: 14px;">${location.name}</h4>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">📍 Zona ${location.zone}</p>
          <button 
            onclick="window.selectMapLocation('${location.name.replace(/'/g, "\\'")}')" 
            style="
              width: 100%;
              padding: 8px 12px;
              background: linear-gradient(135deg, #8B1E41, #B23556);
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
              box-shadow: 0 2px 6px rgba(139, 30, 65, 0.3);
              transition: all 0.3s ease;
            "
            onmouseover="this.style.transform='scale(1.05)'"
            onmouseout="this.style.transform='scale(1)'"
          >
            ${activeMarker === 'origin' ? '🟢 Seleccionar como Origen' : '🔴 Seleccionar como Destino'}
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push({ marker, location });
    });

    // Intentar obtener ubicación actual del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userIcon = window.L.divIcon({
            className: 'user-location-marker',
            html: '<div style="background: #4285F4; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(66, 133, 244, 0.6), 0 0 0 6px rgba(66, 133, 244, 0.2);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          window.L.marker([position.coords.latitude, position.coords.longitude], {
            icon: userIcon,
            title: 'Tu ubicación actual'
          }).addTo(map).bindPopup('📍 Tu ubicación actual');
        },
        () => {
          console.log('No se pudo obtener la ubicación del usuario');
        }
      );
    }

        // Función global para seleccionar ubicaciones desde popup
        window.selectMapLocation = (locationName) => {
          const location = cochabambaLocations.find(loc => loc.name === locationName);
          if (location) {
            handleLocationClick(location);
            map.closePopup();
          }
        };
      } catch (error) {
        console.error('Error inicializando mapa:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (googleMapRef.current) {
        try {
          googleMapRef.current.remove();
        } catch (e) {
          console.error('Error removiendo mapa:', e);
        }
        googleMapRef.current = null;
      }
      markersRef.current = [];
      delete window.selectMapLocation;
    };
  }, [activeMarker]);

  // Dibujar ruta cuando ambos puntos están seleccionados
  useEffect(() => {
    if (selectedOrigin && selectedDestination && googleMapRef.current && window.L) {
      try {
        // Limpiar ruta y marcadores anteriores
        if (routeLineRef.current) {
          // Limpiar también la sombra si existe
          if (routeLineRef.current.shadowLine) {
            googleMapRef.current.removeLayer(routeLineRef.current.shadowLine);
          }
          // Limpiar línea interior si existe
          if (routeLineRef.current.innerLine) {
            googleMapRef.current.removeLayer(routeLineRef.current.innerLine);
          }
          googleMapRef.current.removeLayer(routeLineRef.current);
          routeLineRef.current = null;
        }
        if (originMarkerRef.current) {
          googleMapRef.current.removeLayer(originMarkerRef.current);
          originMarkerRef.current = null;
        }
        if (destinationMarkerRef.current) {
          googleMapRef.current.removeLayer(destinationMarkerRef.current);
          destinationMarkerRef.current = null;
        }

      // Icono para origen (verde)
      const originIcon = window.L.divIcon({
        className: 'origin-marker',
        html: `
          <div style="position: relative;">
            <div style="
              background: linear-gradient(135deg, #4CAF50, #45a049);
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(76, 175, 80, 0.5);
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="transform: rotate(45deg); font-size: 16px;">🚗</span>
            </div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40]
      });

      // Icono para destino (rojo)
      const destinationIcon = window.L.divIcon({
        className: 'destination-marker',
        html: `
          <div style="position: relative;">
            <div style="
              background: linear-gradient(135deg, #F44336, #d32f2f);
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(244, 67, 54, 0.5);
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="transform: rotate(45deg); font-size: 16px;">🎯</span>
            </div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40]
      });

      // Agregar marcador de origen
      originMarkerRef.current = window.L.marker(
        [selectedOrigin.coords.lat, selectedOrigin.coords.lng],
        { icon: originIcon }
      ).addTo(googleMapRef.current)
        .bindPopup(`<b>🟢 Origen:</b><br>${selectedOrigin.name}`);

      // Agregar marcador de destino
      destinationMarkerRef.current = window.L.marker(
        [selectedDestination.coords.lat, selectedDestination.coords.lng],
        { icon: destinationIcon }
      ).addTo(googleMapRef.current)
        .bindPopup(`<b>🔴 Destino:</b><br>${selectedDestination.name}`);

      // Obtener ruta real usando OSRM (Open Source Routing Machine)
      const originCoords = `${selectedOrigin.coords.lng},${selectedOrigin.coords.lat}`;
      const destCoords = `${selectedDestination.coords.lng},${selectedDestination.coords.lat}`;
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords};${destCoords}?overview=full&geometries=geojson`;

      fetch(osrmUrl)
        .then(response => response.json())
        .then(data => {
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

            // Primero dibujar sombra (capa inferior)
            const routeShadow = window.L.polyline(coordinates, {
              color: '#000000',
              weight: 10,
              opacity: 0.3,
              lineJoin: 'round',
              lineCap: 'round',
              interactive: false
            }).addTo(googleMapRef.current);

            // Luego la línea principal (capa superior)
            const routePath = window.L.polyline(coordinates, {
              color: '#FF1744',
              weight: 7,
              opacity: 1,
              lineJoin: 'round',
              lineCap: 'round',
              dashArray: '15, 10',
              dashOffset: '0',
              className: 'animated-route-line'
            }).addTo(googleMapRef.current);

            // Línea blanca interior para efecto de borde
            const routeInner = window.L.polyline(coordinates, {
              color: '#FFFFFF',
              weight: 3,
              opacity: 0.6,
              lineJoin: 'round',
              lineCap: 'round',
              dashArray: '15, 10',
              dashOffset: '0',
              interactive: false
            }).addTo(googleMapRef.current);

            routeLineRef.current = routePath;
            routePath.shadowLine = routeShadow;
            routePath.innerLine = routeInner;

            // Ajustar vista para mostrar toda la ruta
            googleMapRef.current.fitBounds(routePath.getBounds(), { 
              padding: [60, 60],
              maxZoom: 15 
            });

            // Calcular distancia y duración
            const distance = (route.distance / 1000).toFixed(1); // km
            const duration = Math.round(route.duration / 60); // minutos

            console.log(`Ruta calculada: ${distance} km, ${duration} min`);
          } else {
            // Si no se puede obtener ruta, dibujar línea recta
            console.warn('No se pudo obtener ruta por calles, dibujando línea directa');
            const routePath = window.L.polyline(
              [
                [selectedOrigin.coords.lat, selectedOrigin.coords.lng],
                [selectedDestination.coords.lat, selectedDestination.coords.lng]
              ],
              {
                color: '#8B1E41',
                weight: 5,
                opacity: 0.8,
                dashArray: '10, 10',
                className: 'animated-route-line'
              }
            ).addTo(googleMapRef.current);

            routeLineRef.current = routePath;

            // Ajustar vista
            const bounds = window.L.latLngBounds([
              [selectedOrigin.coords.lat, selectedOrigin.coords.lng],
              [selectedDestination.coords.lat, selectedDestination.coords.lng]
            ]);
            googleMapRef.current.fitBounds(bounds, { padding: [50, 50] });
          }
        })
        .catch(error => {
          console.error('Error obteniendo ruta:', error);
          // Fallback: dibujar línea recta
          const routePath = window.L.polyline(
            [
              [selectedOrigin.coords.lat, selectedOrigin.coords.lng],
              [selectedDestination.coords.lat, selectedDestination.coords.lng]
            ],
            {
              color: '#8B1E41',
              weight: 5,
              opacity: 0.8,
              dashArray: '10, 10',
              className: 'animated-route-line'
            }
          ).addTo(googleMapRef.current);

          routeLineRef.current = routePath;
        });
      } catch (error) {
        console.error('Error dibujando ruta:', error);
      }
    }
  }, [selectedOrigin, selectedDestination]);

  const handleLocationClick = (location) => {
    if (activeMarker === 'origin') {
      setSelectedOrigin(location);
      

      
      if (onLocationSelect) {
        onLocationSelect({ origin: location, destination: selectedDestination });
      }
    } else {
      setSelectedDestination(location);
      

      
      if (onLocationSelect) {
        onLocationSelect({ origin: selectedOrigin, destination: location });
      }
    }
    setSearchQuery('');
    setSuggestions([]);
  };

  const clearSelection = () => {
    if (activeMarker === 'origin') {
      setSelectedOrigin(null);
    } else {
      setSelectedDestination(null);
    }
    if (onLocationSelect) {
      onLocationSelect({ 
        origin: activeMarker === 'origin' ? null : selectedOrigin, 
        destination: activeMarker === 'destination' ? null : selectedDestination 
      });
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log('Tu navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Encontrar la ubicación más cercana a la posición actual del usuario
        let closestLocation = null;
        let minDistance = Infinity;

        cochabambaLocations.forEach(location => {
          // Calcular distancia usando fórmula de Haversine simplificada
          const latDiff = location.coords.lat - userLat;
          const lngDiff = location.coords.lng - userLng;
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

          if (distance < minDistance) {
            minDistance = distance;
            closestLocation = location;
          }
        });

        if (closestLocation) {
          // Crear una ubicación especial para "Ubicación actual"
          const currentLocationData = {
            name: 'Mi ubicación actual',
            coords: { lat: userLat, lng: userLng },
            zone: closestLocation.zone // Usar la zona del lugar más cercano
          };

          handleLocationClick(currentLocationData);

          // Centrar el mapa en la ubicación actual
          if (googleMapRef.current) {
            googleMapRef.current.setView([userLat, userLng], 15);
          }
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="interactive-map-container">
      {/* Panel de control */}
      <div className="map-control-panel">
        <h3 className="map-title">
          <span className="map-title-icon">🗺️</span>
          Selecciona tu Ruta
        </h3>
        
        {/* Selector de marcador activo */}
        <div className="marker-selector">
          <button 
            className={`marker-btn ${activeMarker === 'origin' ? 'active' : ''}`}
            onClick={() => setActiveMarker('origin')}
          >
            <span className="marker-icon">📍</span>
            Origen
            {selectedOrigin && <span className="marker-check">✓</span>}
          </button>
          <button 
            className={`marker-btn ${activeMarker === 'destination' ? 'active' : ''}`}
            onClick={() => setActiveMarker('destination')}
          >
            <span className="marker-icon">🎯</span>
            Destino
            {selectedDestination && <span className="marker-check">✓</span>}
          </button>
        </div>

        {/* Búsqueda de ubicaciones */}
        <div className="map-search">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input 
              type="text"
              placeholder={`Buscar ${activeMarker === 'origin' ? 'origen' : 'destino'}...`}
              value={searchQuery}
              onChange={handleSearchChange}
              className="map-search-input"
              style={{ flex: 1 }}
            />
            {activeMarker === 'origin' && (
              <button
                type="button"
                onClick={useCurrentLocation}
                className="current-location-btn"
                style={{
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  width: '44px',
                  height: '44px',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #4285F4, #357ae8)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title="Mi ubicación"
              >
                📍
              </button>
            )}
          </div>
          {suggestions.length > 0 && (
            <div className="map-suggestions">
              {suggestions.map((location, index) => (
                <div 
                  key={index} 
                  className="suggestion-item"
                  onClick={() => handleLocationClick(location)}
                >
                  <span className="suggestion-icon">📍</span>
                  <div className="suggestion-content">
                    <div className="suggestion-name">{location.name}</div>
                    <div className="suggestion-zone">Zona {location.zone}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ubicaciones seleccionadas */}
        <div className="selected-locations">
          <div className={`location-card ${selectedOrigin ? 'selected' : 'empty'}`}>
            <div className="location-header">
              <span className="location-icon">�</span>
              <span className="location-label">Origen</span>
            </div>
            {selectedOrigin ? (
              <>
                <div className="location-name">{selectedOrigin.name}</div>
                <div className="location-zone">Zona {selectedOrigin.zone}</div>
                <button className="location-clear" onClick={clearSelection}>✕</button>
              </>
            ) : (
              <div className="location-placeholder">No seleccionado</div>
            )}
          </div>

          <div className="route-arrow">→</div>

          <div className={`location-card ${selectedDestination ? 'selected' : 'empty'}`}>
            <div className="location-header">
              <span className="location-icon">🎯</span>
              <span className="location-label">Destino</span>
            </div>
            {selectedDestination ? (
              <>
                <div className="location-name">{selectedDestination.name}</div>
                <div className="location-zone">Zona {selectedDestination.zone}</div>
                <button className="location-clear" onClick={clearSelection}>✕</button>
              </>
            ) : (
              <div className="location-placeholder">No seleccionado</div>
            )}
          </div>
        </div>
      </div>

      {/* Google Maps Interactivo Real */}
      <div 
        ref={mapRef} 
        className="map-canvas google-map-container"
        style={{ height: '450px', width: '100%', borderRadius: '12px' }}
      ></div>



      {/* Info de distancia estimada */}
      {selectedOrigin && selectedDestination && (
        <div className="route-info-footer">
          <div className="route-info-item">
            <span className="info-icon">📏</span>
            <span className="info-label">Distancia estimada:</span>
            <span className="info-value">~{Math.floor(Math.random() * 15 + 5)} km</span>
          </div>
          <div className="route-info-item">
            <span className="info-icon">⏱️</span>
            <span className="info-label">Tiempo estimado:</span>
            <span className="info-value">~{Math.floor(Math.random() * 30 + 10)} min</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default { RouteCard, CreateRouteForm, RoutesMap, MyRoutesAsDriver, InteractiveRouteMap };