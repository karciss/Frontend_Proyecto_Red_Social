import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Heading, Avatar, Divider } from './UIComponents';

/**
 * Componente de perfil de usuario que muestra la información según el rol
 * y la estructura de la base de datos
 */
const UserProfile = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [profileData, setProfileData] = useState(null);
  
  // Simular la obtención de datos del perfil
  useEffect(() => {
    // Datos simulados según el rol del usuario
    if (user) {
      if (user.rol === 'estudiante') {
        setProfileData({
          info: {
            ci: user.ci_est || '12345678',
            nombre: user.nombre || 'María',
            apellido: user.apellido || 'Rodríguez',
            correo: user.correo || 'maria@univalle.edu',
            telefono: '77712345',
            direccion: 'Av. Universidad #123',
            fechaNacimiento: '1999-05-15',
            carrera: user.carrera || 'Ingeniería de Sistemas',
            semestre: user.semestre || 6,
            facultad: 'Ingeniería',
            materiasCursadas: 28,
            promedio: 85.6
          },
          materias: [
            { codigo: 'INF-310', nombre: 'Desarrollo Web Avanzado', docente: 'Carlos Mendoza', nota: 88 },
            { codigo: 'INF-315', nombre: 'Inteligencia Artificial', docente: 'Laura Espinoza', nota: 92 },
            { codigo: 'INF-320', nombre: 'Desarrollo Móvil', docente: 'Roberto Salinas', nota: 85 },
            { codigo: 'MAT-250', nombre: 'Estadística para Informática', docente: 'Patricia Rojas', nota: 79 }
          ],
          actividades: [
            { fecha: '2025-10-10', tipo: 'Académico', descripcion: 'Entrega de proyecto final de IA' },
            { fecha: '2025-10-08', tipo: 'Social', descripcion: 'Publicación en el foro de estudiantes' },
            { fecha: '2025-10-05', tipo: 'Carpooling', descripcion: 'Viaje compartido al campus' },
            { fecha: '2025-10-01', tipo: 'Académico', descripcion: 'Inscripción a taller de programación' }
          ]
        });
      } else if (user.rol === 'docente') {
        setProfileData({
          info: {
            ci: user.ci_doc || '87654321',
            nombre: user.nombre || 'Carlos',
            apellido: user.apellido || 'Mendoza',
            correo: user.correo || 'carlos@univalle.edu',
            telefono: '77798765',
            direccion: 'Calle Profesores #456',
            fechaNacimiento: '1980-03-22',
            especialidad: user.especialidad_doc || 'Desarrollo Web',
            departamento: 'Informática',
            facultad: 'Ingeniería',
            añosExperiencia: 8,
            grado: 'Doctor en Ciencias de la Computación'
          },
          materias: [
            { codigo: 'INF-310', nombre: 'Desarrollo Web Avanzado', estudiantes: 25, horario: 'Lu-Mi 08:00-10:00' },
            { codigo: 'INF-210', nombre: 'Programación Web', estudiantes: 30, horario: 'Ma-Ju 10:00-12:00' },
            { codigo: 'INF-110', nombre: 'Introducción a la Programación', estudiantes: 35, horario: 'Mi-Vi 14:00-16:00' }
          ],
          investigaciones: [
            { titulo: 'Aplicaciones de IA en Educación Superior', fecha: '2024-2025', estado: 'En curso' },
            { titulo: 'Frameworks modernos para desarrollo web', fecha: '2022-2024', estado: 'Completado' }
          ]
        });
      } else if (user.rol === 'administrador') {
        setProfileData({
          info: {
            ci: '11223344',
            nombre: user.nombre || 'Laura',
            apellido: user.apellido || 'Espinoza',
            correo: user.correo || 'admin@univalle.edu',
            telefono: '77745678',
            direccion: 'Av. Central #789',
            fechaNacimiento: '1985-11-10',
            departamento: 'Administración Académica',
            cargo: 'Administrador de Sistemas',
            fechaContratacion: '2018-03-15',
            permisos: 'Todos los módulos'
          },
          actividades: [
            { fecha: '2025-10-14', descripcion: 'Actualización de sistema académico', modulo: 'Académico' },
            { fecha: '2025-10-12', descripcion: 'Revisión de reportes de usuarios', modulo: 'Usuarios' },
            { fecha: '2025-10-10', descripcion: 'Mantenimiento de base de datos', modulo: 'Sistema' },
            { fecha: '2025-10-05', descripcion: 'Configuración de permisos', modulo: 'Seguridad' }
          ],
          estadisticas: {
            usuariosActivos: 1234,
            materiasRegistradas: 87,
            publicacionesHoy: 56,
            viajesCompartidos: 23
          }
        });
      }
    }
  }, [user]);

  if (!user || !profileData) {
    return (
      <div style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
        <Heading level={3}>Cargando perfil...</Heading>
      </div>
    );
  }

  // Renderiza la barra de pestañas del perfil
  const renderTabs = () => (
    <div style={{
      display: 'flex',
      borderBottom: `1px solid ${theme.colors.border}`,
      marginBottom: theme.spacing.lg
    }}>
      <ProfileTab 
        label="Información Personal" 
        active={activeTab === 'info'} 
        onClick={() => setActiveTab('info')} 
      />
      
      {user.rol === 'estudiante' && (
        <>
          <ProfileTab 
            label="Materias" 
            active={activeTab === 'materias'} 
            onClick={() => setActiveTab('materias')} 
          />
          <ProfileTab 
            label="Actividad Reciente" 
            active={activeTab === 'actividad'} 
            onClick={() => setActiveTab('actividad')} 
          />
        </>
      )}

      {user.rol === 'docente' && (
        <>
          <ProfileTab 
            label="Materias" 
            active={activeTab === 'materias'} 
            onClick={() => setActiveTab('materias')} 
          />
          <ProfileTab 
            label="Investigaciones" 
            active={activeTab === 'investigaciones'} 
            onClick={() => setActiveTab('investigaciones')} 
          />
        </>
      )}

      {user.rol === 'administrador' && (
        <>
          <ProfileTab 
            label="Actividad Administrativa" 
            active={activeTab === 'actividad'} 
            onClick={() => setActiveTab('actividad')} 
          />
          <ProfileTab 
            label="Estadísticas" 
            active={activeTab === 'estadisticas'} 
            onClick={() => setActiveTab('estadisticas')} 
          />
        </>
      )}
    </div>
  );

  // Componente para botones de pestañas del perfil
  const ProfileTab = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      style={{
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        backgroundColor: 'transparent',
        color: active ? theme.colors.primary : theme.colors.text,
        border: 'none',
        borderBottom: active 
          ? `3px solid ${theme.colors.primary}` 
          : `3px solid transparent`,
        cursor: 'pointer',
        fontWeight: active ? 'bold' : 'normal',
        transition: 'all 0.2s'
      }}
    >
      {label}
    </button>
  );

  // Renderiza la información del usuario según su rol
  const renderUserInfo = () => (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.lg
      }}>
        <div style={{ 
          flex: '1 1 200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Avatar 
            initials={`${profileData.info.nombre?.charAt(0) || ''}${profileData.info.apellido?.charAt(0) || ''}`}
            size="xlarge"
            style={{ marginBottom: theme.spacing.md }}
          />
          
          <Heading level={2} style={{ marginBottom: theme.spacing.xs }}>
            {profileData.info.nombre} {profileData.info.apellido}
          </Heading>
          
          <div style={{ 
            backgroundColor: user.rol === 'administrador' 
              ? theme.colors.primary 
              : user.rol === 'docente' 
                ? theme.colors.info 
                : theme.colors.success,
            color: 'white',
            padding: `${theme.spacing.xs} ${theme.spacing.md}`,
            borderRadius: theme.borderRadius.full,
            fontSize: '0.9rem',
            fontWeight: 'bold',
            marginBottom: theme.spacing.md
          }}>
            {user.rol.toUpperCase()}
          </div>
          
          {user.rol === 'estudiante' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: theme.colors.textLight, marginBottom: theme.spacing.xs }}>
                Carrera
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: theme.spacing.md }}>
                {profileData.info.carrera}
              </div>
              <div style={{ color: theme.colors.textLight, marginBottom: theme.spacing.xs }}>
                Semestre
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: theme.spacing.md }}>
                {profileData.info.semestre}º Semestre
              </div>
            </div>
          )}
          
          {user.rol === 'docente' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: theme.colors.textLight, marginBottom: theme.spacing.xs }}>
                Especialidad
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: theme.spacing.md }}>
                {profileData.info.especialidad}
              </div>
              <div style={{ color: theme.colors.textLight, marginBottom: theme.spacing.xs }}>
                Departamento
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: theme.spacing.md }}>
                {profileData.info.departamento}
              </div>
            </div>
          )}
          
          {user.rol === 'administrador' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: theme.colors.textLight, marginBottom: theme.spacing.xs }}>
                Cargo
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: theme.spacing.md }}>
                {profileData.info.cargo}
              </div>
              <div style={{ color: theme.colors.textLight, marginBottom: theme.spacing.xs }}>
                Departamento
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: theme.spacing.md }}>
                {profileData.info.departamento}
              </div>
            </div>
          )}
          
          <Button variant="primary">
            Editar Perfil
          </Button>
        </div>
        
        <Card style={{ flex: '2 1 400px' }}>
          <Heading level={3}>Información Personal</Heading>
          <Divider margin="md" />
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing.md
          }}>
            <InfoItem label="CI/DNI" value={profileData.info.ci} />
            <InfoItem label="Correo" value={profileData.info.correo} />
            <InfoItem label="Teléfono" value={profileData.info.telefono} />
            <InfoItem label="Dirección" value={profileData.info.direccion} />
            <InfoItem label="Fecha de Nacimiento" value={profileData.info.fechaNacimiento} />
            
            {user.rol === 'estudiante' && (
              <>
                <InfoItem label="Facultad" value={profileData.info.facultad} />
                <InfoItem label="Materias Cursadas" value={profileData.info.materiasCursadas} />
                <InfoItem 
                  label="Promedio General" 
                  value={`${profileData.info.promedio} / 100`}
                  highlight={true} 
                />
              </>
            )}
            
            {user.rol === 'docente' && (
              <>
                <InfoItem label="Facultad" value={profileData.info.facultad} />
                <InfoItem label="Años de Experiencia" value={profileData.info.añosExperiencia} />
                <InfoItem label="Grado Académico" value={profileData.info.grado} />
              </>
            )}
            
            {user.rol === 'administrador' && (
              <>
                <InfoItem label="Fecha Contratación" value={profileData.info.fechaContratacion} />
                <InfoItem label="Permisos" value={profileData.info.permisos} />
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  // Renderiza la lista de materias para estudiantes y docentes
  const renderMaterias = () => {
    if (user.rol === 'estudiante') {
      return (
        <div>
          <Card>
            <Heading level={3} style={{ marginBottom: theme.spacing.md }}>Materias Inscritas</Heading>
            
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              marginBottom: theme.spacing.md
            }}>
              <thead>
                <tr style={{ backgroundColor: `${theme.colors.primary}15` }}>
                  <th style={tableHeaderStyle}>Código</th>
                  <th style={tableHeaderStyle}>Materia</th>
                  <th style={tableHeaderStyle}>Docente</th>
                  <th style={tableHeaderStyle}>Calificación</th>
                </tr>
              </thead>
              <tbody>
                {profileData.materias.map((materia, index) => (
                  <tr key={materia.codigo} style={{ 
                    backgroundColor: index % 2 === 0 ? 'transparent' : `${theme.colors.background}`
                  }}>
                    <td style={tableCellStyle}>{materia.codigo}</td>
                    <td style={tableCellStyle}>{materia.nombre}</td>
                    <td style={tableCellStyle}>{materia.docente}</td>
                    <td style={{
                      ...tableCellStyle,
                      fontWeight: 'bold',
                      color: materia.nota >= 70 ? theme.colors.success : theme.colors.notification
                    }}>
                      {materia.nota}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ textAlign: 'center' }}>
              <Button variant="secondary">
                Ver Historial Académico Completo
              </Button>
            </div>
          </Card>
        </div>
      );
    } else if (user.rol === 'docente') {
      return (
        <div>
          <Card>
            <Heading level={3} style={{ marginBottom: theme.spacing.md }}>Materias Impartidas</Heading>
            
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              marginBottom: theme.spacing.md
            }}>
              <thead>
                <tr style={{ backgroundColor: `${theme.colors.primary}15` }}>
                  <th style={tableHeaderStyle}>Código</th>
                  <th style={tableHeaderStyle}>Materia</th>
                  <th style={tableHeaderStyle}>Estudiantes</th>
                  <th style={tableHeaderStyle}>Horario</th>
                  <th style={tableHeaderStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {profileData.materias.map((materia, index) => (
                  <tr key={materia.codigo} style={{ 
                    backgroundColor: index % 2 === 0 ? 'transparent' : `${theme.colors.background}`
                  }}>
                    <td style={tableCellStyle}>{materia.codigo}</td>
                    <td style={tableCellStyle}>{materia.nombre}</td>
                    <td style={tableCellStyle}>{materia.estudiantes}</td>
                    <td style={tableCellStyle}>{materia.horario}</td>
                    <td style={tableCellStyle}>
                      <Button variant="info" size="small">
                        Gestionar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ textAlign: 'center' }}>
              <Button variant="secondary">
                Ver Todos los Cursos
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    
    return null;
  };

  // Renderiza la actividad reciente para estudiantes
  const renderActividad = () => {
    if (user.rol === 'estudiante') {
      return (
        <div>
          <Card>
            <Heading level={3}>Actividad Reciente</Heading>
            <div style={{ marginTop: theme.spacing.md }}>
              {profileData.actividades.map((actividad, index) => (
                <div key={index} style={{ 
                  padding: theme.spacing.md,
                  borderBottom: index < profileData.actividades.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ 
                    marginRight: theme.spacing.md,
                    padding: theme.spacing.xs,
                    borderRadius: theme.borderRadius.small,
                    backgroundColor: actividad.tipo === 'Académico' 
                      ? `${theme.colors.info}15` 
                      : actividad.tipo === 'Social' 
                        ? `${theme.colors.success}15` 
                        : `${theme.colors.primary}15`,
                    color: actividad.tipo === 'Académico' 
                      ? theme.colors.info 
                      : actividad.tipo === 'Social' 
                        ? theme.colors.success 
                        : theme.colors.primary,
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {actividad.tipo}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div>{actividad.descripcion}</div>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.textLight }}>{actividad.fecha}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    } else if (user.rol === 'administrador') {
      return (
        <div>
          <Card>
            <Heading level={3}>Actividad Administrativa</Heading>
            <div style={{ marginTop: theme.spacing.md }}>
              {profileData.actividades.map((actividad, index) => (
                <div key={index} style={{ 
                  padding: theme.spacing.md,
                  borderBottom: index < profileData.actividades.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ 
                    marginRight: theme.spacing.md,
                    padding: theme.spacing.xs,
                    borderRadius: theme.borderRadius.small,
                    backgroundColor: `${theme.colors.primary}15`,
                    color: theme.colors.primary,
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {actividad.modulo}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div>{actividad.descripcion}</div>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.textLight }}>{actividad.fecha}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    }
    
    return null;
  };

  // Renderiza las investigaciones para docentes
  const renderInvestigaciones = () => {
    if (user.rol === 'docente') {
      return (
        <div>
          <Card>
            <Heading level={3}>Proyectos e Investigaciones</Heading>
            <div style={{ marginTop: theme.spacing.md }}>
              {profileData.investigaciones.map((investigacion, index) => (
                <div key={index} style={{ 
                  padding: theme.spacing.md,
                  borderBottom: index < profileData.investigaciones.length - 1 ? `1px solid ${theme.colors.border}` : 'none'
                }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: theme.spacing.xs
                  }}>
                    <h4 style={{ margin: 0 }}>{investigacion.titulo}</h4>
                    <span style={{
                      backgroundColor: investigacion.estado === 'En curso' 
                        ? `${theme.colors.info}15` 
                        : `${theme.colors.success}15`,
                      color: investigacion.estado === 'En curso' 
                        ? theme.colors.info
                        : theme.colors.success,
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      borderRadius: theme.borderRadius.small,
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {investigacion.estado}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: theme.colors.textLight }}>
                    Periodo: {investigacion.fecha}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              textAlign: 'center',
              marginTop: theme.spacing.lg 
            }}>
              <Button variant="primary">
                Añadir Nueva Investigación
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    
    return null;
  };

  // Renderiza las estadísticas para administradores
  const renderEstadisticas = () => {
    if (user.rol === 'administrador') {
      const { estadisticas } = profileData;
      
      return (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: theme.spacing.md,
            marginBottom: theme.spacing.lg
          }}>
            <StatCard 
              title="Usuarios Activos" 
              value={estadisticas.usuariosActivos} 
              icon="👥"
              color={theme.colors.success}
            />
            <StatCard 
              title="Materias Registradas" 
              value={estadisticas.materiasRegistradas} 
              icon="📚"
              color={theme.colors.info}
            />
            <StatCard 
              title="Publicaciones Hoy" 
              value={estadisticas.publicacionesHoy} 
              icon="📝"
              color={theme.colors.primary}
            />
            <StatCard 
              title="Viajes Compartidos" 
              value={estadisticas.viajesCompartidos} 
              icon="🚗"
              color={theme.colors.accent}
            />
          </div>
          
          <Card>
            <Heading level={3}>Accesos Rápidos</Heading>
            <Divider margin="md" />
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: theme.spacing.md
            }}>
              <QuickAccessButton icon="👥" label="Gestionar Usuarios" />
              <QuickAccessButton icon="📚" label="Gestionar Materias" />
              <QuickAccessButton icon="🏢" label="Gestionar Departamentos" />
              <QuickAccessButton icon="📊" label="Ver Reportes" />
              <QuickAccessButton icon="⚙️" label="Configuración" />
              <QuickAccessButton icon="💾" label="Respaldo de Datos" />
            </div>
          </Card>
        </div>
      );
    }
    
    return null;
  };

  // Componente para mostrar información en el perfil
  const InfoItem = ({ label, value, highlight = false }) => (
    <div style={{ marginBottom: theme.spacing.sm }}>
      <div style={{ 
        color: theme.colors.textLight, 
        fontSize: '0.9rem', 
        marginBottom: theme.spacing.xs 
      }}>
        {label}
      </div>
      <div style={{ 
        fontWeight: highlight ? 'bold' : 'normal',
        color: highlight ? theme.colors.primary : theme.colors.text
      }}>
        {value}
      </div>
    </div>
  );

  // Componente para tarjetas de estadísticas
  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: '50px',
          height: '50px',
          backgroundColor: `${color}15`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          marginRight: theme.spacing.md
        }}>
          {icon}
        </div>
        <div>
          <div style={{ color: theme.colors.textLight }}>{title}</div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color
          }}>
            {value}
          </div>
        </div>
      </div>
    </Card>
  );

  // Componente para botones de acceso rápido
  const QuickAccessButton = ({ icon, label }) => (
    <button style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      backgroundColor: `${theme.colors.primary}10`,
      border: 'none',
      borderRadius: theme.borderRadius.medium,
      cursor: 'pointer',
      transition: 'all 0.2s',
      height: '100px'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: theme.spacing.sm }}>{icon}</div>
      <div>{label}</div>
    </button>
  );

  // Estilos para celdas de tabla
  const tableHeaderStyle = {
    padding: theme.spacing.md,
    textAlign: 'left',
    fontWeight: 'bold'
  };

  const tableCellStyle = {
    padding: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.border}`
  };

  return (
    <div style={{ padding: theme.spacing.lg }}>
      <Heading level={1} style={{ marginBottom: theme.spacing.md }}>
        Mi Perfil
      </Heading>
      
      {renderTabs()}
      
      {activeTab === 'info' && renderUserInfo()}
      {activeTab === 'materias' && renderMaterias()}
      {activeTab === 'actividad' && renderActividad()}
      {activeTab === 'investigaciones' && renderInvestigaciones()}
      {activeTab === 'estadisticas' && renderEstadisticas()}

      <div className="profile-card" style={{maxWidth: 320, margin: '2rem auto'}}>
        <img src={user?.avatar || "https://ui-avatars.com/api/?name="+profileData.info.nombre} alt="avatar" />
        <div className="profile-name">{profileData.info.nombre} {profileData.info.apellido}</div>
        <div style={{fontWeight: 'bold', color: '#888', marginBottom: '0.5rem'}}>{user.rol.toUpperCase()}</div>
        <Button variant="primary">Editar Perfil</Button>
      </div>
    </div>
  );
};

export default UserProfile;