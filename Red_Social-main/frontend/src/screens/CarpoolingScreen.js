import React, { useState } from 'react';
import { RouteCard } from '../components/CarpoolingComponents';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Carpooling.css';

// Importamos el CSS personalizado para la vista de carpooling

const CarpoolingScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);

  const routes = [
    {
      id: 1,
      origin: 'Zona Sur',
      destination: 'Campus Universidad',
      driver: 'María López',
      time: '07:30',
      days: ['Lunes', 'Miércoles', 'Viernes'],
      occupiedSeats: 2,
      capacity: 4,
      stops: [
        { name: 'Plaza San Miguel', time: '07:15' },
        { name: 'Avenida Las Américas', time: '07:25' }
      ]
    },
    {
      id: 2,
      origin: 'Zona Norte',
      destination: 'Campus Universidad',
      driver: 'Carlos Gutiérrez',
      time: '08:00',
      days: ['Lunes', 'Martes', 'Jueves'],
      occupiedSeats: 3,
      capacity: 3,
      stops: [
        { name: 'Plaza Principal', time: '07:40' },
        { name: 'Parque Central', time: '07:50' }
      ]
    },
    {
      id: 3,
      origin: 'Zona Este',
      destination: 'Campus Universidad',
      driver: 'Ana Martínez',
      time: '07:45',
      days: ['Martes', 'Jueves', 'Viernes'],
      occupiedSeats: 1,
      capacity: 4,
      stops: [
        { name: 'Centro Comercial Este', time: '07:30' },
        { name: 'Terminal de Buses', time: '07:40' }
      ]
    }
  ];

  const handleJoinRoute = (routeId) => {
    alert(`Te has unido a la ruta ${routeId}. El conductor será notificado.`);
  };

  const handleViewMap = (routeId) => {
    setShowMap(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRoutes = searchTerm 
    ? routes.filter(route => 
        route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.days.some(day => day.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : routes;

  const handleSubmitNewRide = () => {
    // Validación básica
    const { origin, destination, date, time } = newRideForm;
    if (!origin || !destination || !date || !time) {
      // Mostrar error
      return;
    }

    // Crear nuevo viaje
    const newRide = {
      id: Date.now().toString(),
      user: {
        id: user?.id || 'user-123',
        name: user?.nombre || 'Usuario de Prueba',
        avatar: null
      },
      ...newRideForm,
      created_at: new Date().toISOString(),
      status: 'active'
    };

    // Actualizar estado
    setRides([newRide, ...rides]);
    
    // Resetear formulario
    setNewRideForm({
      origin: '',
      destination: '',
      date: '',
      time: '',
      seats: '',
      notes: '',
      type: 'offered'
    });
  };

  const handleInputChange = (field, value) => {
    setNewRideForm({
      ...newRideForm,
      [field]: value
    });
  };

  const renderRideItem = ({ item }) => {
    const isOffered = item.type === 'offered';
    
    return (
      <Card style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <View style={styles.rideUser}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '40' }]}>
              <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                {item.user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {item.user.name}
            </Text>
          </View>
          <View 
            style={[
              styles.rideType, 
              { backgroundColor: isOffered ? theme.colors.success + '30' : theme.colors.warning + '30' }
            ]}
          >
            <Text 
              style={[
                styles.rideTypeText, 
                { color: isOffered ? theme.colors.success : theme.colors.warning }
              ]}
            >
              {isOffered ? 'Ofrece' : 'Solicita'}
            </Text>
          </View>
        </View>

        <View style={styles.rideDetails}>
          <View style={styles.rideDetail}>
            <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>
              Origen:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {item.origin}
            </Text>
          </View>
          
          <View style={styles.rideDetail}>
            <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>
              Destino:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {item.destination}
            </Text>
          </View>
          
          <View style={styles.rideRow}>
            <View style={[styles.rideDetail, styles.halfWidth]}>
              <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>
                Fecha:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {item.date}
              </Text>
            </View>
            
            <View style={[styles.rideDetail, styles.halfWidth]}>
              <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>
                Hora:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {item.time}
              </Text>
            </View>
          </View>

          {item.seats && (
            <View style={styles.rideDetail}>
              <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>
                Asientos disponibles:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {item.seats}
              </Text>
            </View>
          )}

          {item.notes && (
            <View style={styles.rideDetail}>
              <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>
                Notas:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.rideActions}>
          <Button
            title="Ver detalles"
            onPress={() => {/* Acción de ver detalles */}}
            style={styles.actionButton}
          />
        </View>
      </Card>
    );
  };

  const renderNewRideForm = () => (
    <Card style={styles.newRideCard}>
      <Text style={[styles.formTitle, { color: theme.colors.text }]}>
        Nuevo viaje compartido
      </Text>

      <View style={styles.formTypeSelector}>
        <TouchableOpacity 
          style={[
            styles.typeButton, 
            newRideForm.type === 'offered' && [styles.selectedType, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => handleInputChange('type', 'offered')}
        >
          <Text 
            style={[
              styles.typeButtonText, 
              { color: newRideForm.type === 'offered' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Ofrecer viaje
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.typeButton, 
            newRideForm.type === 'requested' && [styles.selectedType, { borderColor: theme.colors.primary }]
          ]}
          onPress={() => handleInputChange('type', 'requested')}
        >
          <Text 
            style={[
              styles.typeButtonText, 
              { color: newRideForm.type === 'requested' ? theme.colors.primary : theme.colors.text }
            ]}
          >
            Solicitar viaje
          </Text>
        </TouchableOpacity>
      </View>

      <FormInput
        label="Origen"
        placeholder="Punto de partida"
        value={newRideForm.origin}
        onChangeText={(text) => handleInputChange('origin', text)}
      />

      <FormInput
        label="Destino"
        placeholder="Punto de llegada"
        value={newRideForm.destination}
        onChangeText={(text) => handleInputChange('destination', text)}
      />

      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <FormInput
            label="Fecha"
            placeholder="DD/MM/AAAA"
            value={newRideForm.date}
            onChangeText={(text) => handleInputChange('date', text)}
          />
        </View>
        
        <View style={styles.formHalf}>
          <FormInput
            label="Hora"
            placeholder="HH:MM"
            value={newRideForm.time}
            onChangeText={(text) => handleInputChange('time', text)}
          />
        </View>
      </View>

      {newRideForm.type === 'offered' && (
        <FormInput
          label="Asientos disponibles"
          placeholder="Número de asientos"
          value={newRideForm.seats}
          onChangeText={(text) => handleInputChange('seats', text)}
          keyboardType="numeric"
        />
      )}

      <FormInput
        label="Notas adicionales"
        placeholder="Información adicional"
        value={newRideForm.notes}
        onChangeText={(text) => handleInputChange('notes', text)}
        multiline
        numberOfLines={3}
      />

      <Button
        title="Publicar viaje"
        onPress={handleSubmitNewRide}
        fullWidth
        style={styles.submitButton}
      />
    </Card>
  );

  return (
    <div className="carpooling-container" style={{ backgroundColor: theme.colors.background }}>
      <div className="carpooling-header">
        <h1 className="carpooling-title" style={{ color: theme.colors.text }}>Carpooling Universitario</h1>
        <p className="carpooling-subtitle">Viaja con compañeros de la universidad y ahorra tiempo y recursos</p>
        
        <div className="carpooling-search">
          <input
            type="text"
            placeholder="Buscar por origen, conductor o día..."
            value={searchTerm}
            onChange={handleSearch}
            className="carpooling-search-input"
          />
          <button 
            className="carpooling-button create-route-button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{ backgroundColor: theme.colors.primary }}
          >
            {showCreateForm ? 'Cancelar' : '+ Crear nueva ruta'}
          </button>
        </div>
        
        <div className="carpooling-view-options">
          <button 
            className={`view-option ${!showMap ? 'active' : ''}`} 
            onClick={() => setShowMap(false)}
            style={{ 
              backgroundColor: !showMap ? theme.colors.primaryLight : 'transparent',
              color: !showMap ? theme.colors.white : theme.colors.text
            }}
          >
            Ver como Lista
          </button>
          <button 
            className={`view-option ${showMap ? 'active' : ''}`}
            onClick={() => setShowMap(true)}
            style={{ 
              backgroundColor: showMap ? theme.colors.primaryLight : 'transparent',
              color: showMap ? theme.colors.white : theme.colors.text
            }}
          >
            Ver en Mapa
          </button>
        </div>
      </div>
      
      {showCreateForm && (
        <div className="create-route-form" style={{ borderColor: theme.colors.border }}>
          <h2 style={{ color: theme.colors.text }}>Crear nueva ruta</h2>
          {/* El formulario se implementará posteriormente */}
          <p>Formulario de creación de rutas (próximamente)</p>
        </div>
      )}

      {!showMap ? (
        <div className="routes-container">
          {filteredRoutes.length > 0 ? (
            filteredRoutes.map(route => (
              <RouteCard 
                key={route.id} 
                route={route} 
                onJoin={() => handleJoinRoute(route.id)}
                onViewMap={() => handleViewMap(route.id)}
              />
            ))
          ) : (
            <div className="no-results">
              <p>No se encontraron rutas con los criterios especificados.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="map-container">
          {/* Implementación del mapa en el futuro */}
          <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: '8px' }}>
            <p>Visualización de mapa (próximamente)</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Datos simulados
const mockRides = [
  {
    id: '1',
    user: {
      id: 'user-123',
      name: 'Juan Pérez',
      avatar: null
    },
    type: 'offered',
    origin: 'Campus Norte',
    destination: 'Centro de la ciudad',
    date: '12/10/2025',
    time: '18:30',
    seats: '3',
    notes: 'Salgo después de la clase de Cálculo. Puedo esperar hasta 10 minutos.',
    created_at: '2025-09-08T14:23:00Z',
    status: 'active'
  },
  {
    id: '2',
    user: {
      id: 'user-456',
      name: 'María González',
      avatar: null
    },
    type: 'requested',
    origin: 'Residencia Estudiantil Este',
    destination: 'Campus Principal',
    date: '13/10/2025',
    time: '07:45',
    notes: 'Tengo examen a las 8:30. Agradecería llegar con tiempo.',
    created_at: '2025-09-08T10:45:00Z',
    status: 'active'
  },
  {
    id: '3',
    user: {
      id: 'user-789',
      name: 'Pedro Sánchez',
      avatar: null
    },
    type: 'offered',
    origin: 'Biblioteca Central',
    destination: 'Estación de Metro Norte',
    date: '13/10/2025',
    time: '20:00',
    seats: '2',
    created_at: '2025-09-07T16:30:00Z',
    status: 'active'
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  newRideCard: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  formTypeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedType: {
    borderWidth: 2,
  },
  typeButtonText: {
    fontWeight: '500',
  },
  formRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  formHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  submitButton: {
    marginTop: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  activeFilter: {
    backgroundColor: '#e0e0e0',
  },
  filterText: {
    fontWeight: '500',
  },
  ridesList: {
    width: '100%',
  },
  rideCard: {
    marginBottom: 16,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rideUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  rideType: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  rideTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rideDetails: {
    marginBottom: 16,
  },
  rideDetail: {
    marginBottom: 8,
  },
  rideRow: {
    flexDirection: 'row',
  },
  halfWidth: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
  },
  rideActions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    minWidth: 150,
  },
});

export default CarpoolingScreen;
