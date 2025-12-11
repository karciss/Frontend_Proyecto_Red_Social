import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Card from '../components/Card';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import UserProfileModule from '../components/UserProfileModule';
import '../styles.css';
import '../styles/UserProfile.css';

/**
 * Pantalla de perfil de usuario con opción para usar la nueva UI
 */
const UserProfileScreen = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [useNewUI, setUseNewUI] = useState(true); // Para alternar entre interfaces
  
  // Botón para alternar entre interfaces
  const toggleUI = () => setUseNewUI(!useNewUI);
  
  // Si se usa la nueva UI, mostrar el componente UserProfileModule
  if (useNewUI) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginBottom: '10px'
        }}>
          <button 
            onClick={toggleUI}
            style={{
              backgroundColor: '#E75A7C',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '8px 15px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Ver UI Original
          </button>
        </div>
        
        <UserProfileModule />
      </div>
    );
  }

  // Carga los datos del usuario cuando el componente se monta
  useEffect(() => {
    // En una aplicación real, aquí se cargarían los datos del usuario desde la API
    // Por ahora, usamos datos de ejemplo basados en el rol del usuario
    if (user) {
      setUserData({
        ...user,
        // Datos adicionales que vendrían de la API
        foto_perfil: user.foto_perfil || 'https://via.placeholder.com/150',
        ultimo_acceso: new Date().toLocaleDateString(),
        // Datos específicos según rol
        ...(user.rol === 'estudiante' && {
          carrera: 'Ingeniería de Sistemas',
          semestre: 6,
          facultad: 'Ingeniería',
          fecha_ingreso: '2020-02-01',
          promedio_general: 82.5,
          creditos_aprobados: 120,
          materias_inscritas: [
            { id: 1, nombre: 'Bases de Datos II', codigo: 'BD-202' },
            { id: 2, nombre: 'Redes de Computadoras', codigo: 'RC-305' },
            { id: 3, nombre: 'Desarrollo Web', codigo: 'DW-401' }
          ]
        }),
        ...(user.rol === 'docente' && {
          especialidad_doc: 'Desarrollo de Software',
          departamento: 'Informática',
          grado_academico: 'Doctorado',
          fecha_contratacion: '2018-01-15',
          materias_asignadas: [
            { id: 1, nombre: 'Bases de Datos II', codigo: 'BD-202', estudiantes: 35 },
            { id: 2, nombre: 'Desarrollo Web', codigo: 'DW-401', estudiantes: 28 }
          ]
        }),
        ...(user.rol === 'administrador' && {
          cargo: 'Coordinador de Sistemas',
          departamento: 'Tecnología',
          nivel_acceso: 'Total',
          fecha_contratacion: '2017-03-20',
          areas_responsabilidad: [
            'Gestión de usuarios',
            'Configuración de sistema',
            'Reportes académicos'
          ]
        })
      });
    }
  }, [user]);

  // Maneja el envío del formulario de edición
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se enviarían los datos actualizados a la API
    setIsEditing(false);
    alert('Perfil actualizado correctamente');
  };

  // Renderizado condicional para diferentes secciones según el rol
  const renderRoleSpecificInfo = () => {
    if (!userData) return null;

    switch (userData.rol) {
      case 'estudiante':
        return (
          <div className="role-specific-info">
            <h3>Información Académica</h3>
            <div className="info-group">
              <div className="info-item">
                <span>Carrera:</span> {userData.carrera}
              </div>
              <div className="info-item">
                <span>Facultad:</span> {userData.facultad}
              </div>
              <div className="info-item">
                <span>Semestre:</span> {userData.semestre}
              </div>
            </div>
            <div className="info-group">
              <div className="info-item">
                <span>Fecha de ingreso:</span> {userData.fecha_ingreso}
              </div>
              <div className="info-item">
                <span>Promedio general:</span> {userData.promedio_general}
              </div>
              <div className="info-item">
                <span>Créditos aprobados:</span> {userData.creditos_aprobados}
              </div>
            </div>
            
            <h3>Materias Inscritas</h3>
            <div className="subject-list">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.materias_inscritas.map(materia => (
                    <tr key={materia.id}>
                      <td>{materia.codigo}</td>
                      <td>{materia.nombre}</td>
                      <td>
                        <Button variant="text" size="small">Ver detalles</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'docente':
        return (
          <div className="role-specific-info">
            <h3>Información Académica</h3>
            <div className="info-group">
              <div className="info-item">
                <span>Especialidad:</span> {userData.especialidad_doc}
              </div>
              <div className="info-item">
                <span>Departamento:</span> {userData.departamento}
              </div>
              <div className="info-item">
                <span>Grado académico:</span> {userData.grado_academico}
              </div>
              <div className="info-item">
                <span>Fecha de contratación:</span> {userData.fecha_contratacion}
              </div>
            </div>
            
            <h3>Materias Asignadas</h3>
            <div className="subject-list">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Estudiantes</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.materias_asignadas.map(materia => (
                    <tr key={materia.id}>
                      <td>{materia.codigo}</td>
                      <td>{materia.nombre}</td>
                      <td>{materia.estudiantes}</td>
                      <td>
                        <Button variant="text" size="small">Administrar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'administrador':
        return (
          <div className="role-specific-info">
            <h3>Información Administrativa</h3>
            <div className="info-group">
              <div className="info-item">
                <span>Cargo:</span> {userData.cargo}
              </div>
              <div className="info-item">
                <span>Departamento:</span> {userData.departamento}
              </div>
              <div className="info-item">
                <span>Nivel de acceso:</span> {userData.nivel_acceso}
              </div>
              <div className="info-item">
                <span>Fecha de contratación:</span> {userData.fecha_contratacion}
              </div>
            </div>
            
            <h3>Áreas de Responsabilidad</h3>
            <ul className="responsibility-list">
              {userData.areas_responsabilidad.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
            
            <div className="admin-actions">
              <h3>Acciones Administrativas</h3>
              <div className="button-group">
                <Button>Ver Registros del Sistema</Button>
                <Button>Generar Reportes</Button>
                <Button>Configurar Parámetros</Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!userData) {
    return <div className="loading">Cargando perfil...</div>;
  }

  return (
    <div className={`user-profile-screen ${theme}`}>
      <h1>Mi Perfil</h1>
      
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-image">
            <img src={userData.foto_perfil} alt={`${userData.nombre} ${userData.apellido}`} />
            {!isEditing && (
              <Button variant="text" size="small" onClick={() => alert('Cambiar foto')}>
                Cambiar foto
              </Button>
            )}
          </div>
          
          <div className="profile-summary">
            <h2>{`${userData.nombre} ${userData.apellido}`}</h2>
            <div className="role-badge">
              {userData.rol.charAt(0).toUpperCase() + userData.rol.slice(1)}
            </div>
            <p>CI: {userData.ci_usuario}</p>
            <p>Último acceso: {userData.ultimo_acceso}</p>
            {!isEditing && (
              <div className="profile-actions">
                <Button onClick={() => setIsEditing(true)}>Editar perfil</Button>
              </div>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <Card className="edit-profile-form">
            <h3>Editar Información Personal</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <FormInput 
                  label="Nombre"
                  value={userData.nombre}
                  onChange={(e) => setUserData({...userData, nombre: e.target.value})}
                  required
                />
                <FormInput 
                  label="Apellido"
                  value={userData.apellido}
                  onChange={(e) => setUserData({...userData, apellido: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-row">
                <FormInput 
                  label="Correo electrónico"
                  type="email"
                  value={userData.correo}
                  onChange={(e) => setUserData({...userData, correo: e.target.value})}
                  required
                />
                <FormInput 
                  label="Teléfono"
                  value={userData.telefono || ''}
                  onChange={(e) => setUserData({...userData, telefono: e.target.value})}
                />
              </div>
              
              <div className="form-row">
                <FormInput 
                  label="Dirección"
                  value={userData.direccion || ''}
                  onChange={(e) => setUserData({...userData, direccion: e.target.value})}
                />
                <FormInput 
                  label="Fecha de nacimiento"
                  type="date"
                  value={userData.fecha_nacimiento || ''}
                  onChange={(e) => setUserData({...userData, fecha_nacimiento: e.target.value})}
                />
              </div>
              
              <div className="form-actions">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar cambios
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="profile-info">
            <Card className="personal-info">
              <h3>Información Personal</h3>
              <div className="info-group">
                <div className="info-item">
                  <span>Correo:</span> {userData.correo}
                </div>
                <div className="info-item">
                  <span>Teléfono:</span> {userData.telefono || 'No especificado'}
                </div>
              </div>
              <div className="info-group">
                <div className="info-item">
                  <span>Dirección:</span> {userData.direccion || 'No especificada'}
                </div>
                <div className="info-item">
                  <span>Fecha de nacimiento:</span> {userData.fecha_nacimiento || 'No especificada'}
                </div>
              </div>
            </Card>
            
            <Card className="role-info">
              {renderRoleSpecificInfo()}
            </Card>
            
            <Card className="security-section">
              <h3>Seguridad de la cuenta</h3>
              <div className="security-actions">
                <Button onClick={() => alert('Cambiar contraseña')}>
                  Cambiar contraseña
                </Button>
                <Button variant="outline" onClick={() => alert('Configurar autenticación en dos pasos')}>
                  Configurar autenticación en dos pasos
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileScreen;