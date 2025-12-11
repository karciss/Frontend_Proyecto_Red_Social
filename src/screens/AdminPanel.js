import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Heading, Divider } from '../components/UIComponents';

/**
 * Panel de Administración para la Red Social Universitaria
 * Permite gestionar usuarios, materias y otros elementos del sistema
 */
const AdminPanel = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para almacenar los datos de las diferentes secciones
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Efecto para cargar datos simulados
  useEffect(() => {
    // Simulación de datos para usuarios
    setUsers([
      { id: 1, nombre: 'María Rodríguez', email: 'maria@univalle.edu', rol: 'estudiante', carrera: 'Ingeniería de Sistemas', estado: 'activo' },
      { id: 2, nombre: 'Carlos Mendoza', email: 'carlos@univalle.edu', rol: 'docente', especialidad: 'Desarrollo Web', estado: 'activo' },
      { id: 3, nombre: 'Laura Espinoza', email: 'laura@univalle.edu', rol: 'administrador', departamento: 'Tecnología', estado: 'activo' },
      { id: 4, nombre: 'Juan Pérez', email: 'juan@univalle.edu', rol: 'estudiante', carrera: 'Administración', estado: 'inactivo' },
      { id: 5, nombre: 'Ana Torres', email: 'ana@univalle.edu', rol: 'docente', especialidad: 'Matemáticas', estado: 'activo' }
    ]);
    
    // Simulación de datos para materias
    setCourses([
      { id: 'INF-310', nombre: 'Desarrollo Web Avanzado', docente: 'Carlos Mendoza', departamento: 'Informática', créditos: 4 },
      { id: 'INF-315', nombre: 'Inteligencia Artificial', docente: 'Laura Espinoza', departamento: 'Informática', créditos: 5 },
      { id: 'ADM-220', nombre: 'Gestión Empresarial', docente: 'Roberto Gómez', departamento: 'Administración', créditos: 3 },
      { id: 'MAT-250', nombre: 'Estadística para Informática', docente: 'Ana Torres', departamento: 'Matemáticas', créditos: 4 },
      { id: 'INF-320', nombre: 'Desarrollo Móvil', docente: 'Carlos Mendoza', departamento: 'Informática', créditos: 4 }
    ]);
    
    // Simulación de datos para departamentos
    setDepartments([
      { id: 1, nombre: 'Informática', director: 'Dr. Pedro López', facultad: 'Ingeniería', numDocentes: 12, numMaterias: 35 },
      { id: 2, nombre: 'Administración', director: 'Dra. Marta Sánchez', facultad: 'Ciencias Económicas', numDocentes: 8, numMaterias: 28 },
      { id: 3, nombre: 'Matemáticas', director: 'Dr. Jorge Ramírez', facultad: 'Ciencias Exactas', numDocentes: 10, numMaterias: 22 },
      { id: 4, nombre: 'Medicina', director: 'Dr. Alberto Mejía', facultad: 'Ciencias de la Salud', numDocentes: 24, numMaterias: 48 }
    ]);
  }, []);

  // Filtrar datos basados en el término de búsqueda
  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredCourses = courses.filter(course =>
    course.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.docente.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredDepartments = departments.filter(dept =>
    dept.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    dept.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.facultad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verificar si el usuario es administrador
  if (user?.rol !== 'administrador') {
    return (
      <div style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
        <Heading level={2}>Acceso Restringido</Heading>
        <p style={{ marginBottom: theme.spacing.lg, color: theme.colors.textLight }}>
          Lo sentimos, necesitas permisos de administrador para acceder a esta página.
        </p>
        <Button variant="primary">Volver al inicio</Button>
      </div>
    );
  }

  // Renderiza la barra de navegación de pestañas
  const renderTabs = () => (
    <div style={{
      display: 'flex',
      borderBottom: `1px solid ${theme.colors.border}`,
      marginBottom: theme.spacing.lg
    }}>
      <TabButton 
        label="Usuarios" 
        active={activeTab === 'usuarios'} 
        onClick={() => setActiveTab('usuarios')} 
      />
      <TabButton 
        label="Materias" 
        active={activeTab === 'materias'} 
        onClick={() => setActiveTab('materias')} 
      />
      <TabButton 
        label="Departamentos" 
        active={activeTab === 'departamentos'} 
        onClick={() => setActiveTab('departamentos')} 
      />
      <TabButton 
        label="Reportes" 
        active={activeTab === 'reportes'} 
        onClick={() => setActiveTab('reportes')} 
      />
      <TabButton 
        label="Configuración" 
        active={activeTab === 'configuracion'} 
        onClick={() => setActiveTab('configuracion')} 
      />
    </div>
  );

  // Componente para botones de pestañas
  const TabButton = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      style={{
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        backgroundColor: active ? theme.colors.primary : 'transparent',
        color: active ? 'white' : theme.colors.text,
        border: 'none',
        borderBottom: active 
          ? `3px solid ${theme.colors.primary}` 
          : `3px solid transparent`,
        borderRadius: `${theme.borderRadius.small} ${theme.borderRadius.small} 0 0`,
        cursor: 'pointer',
        fontWeight: active ? 'bold' : 'normal',
        transition: 'all 0.2s'
      }}
    >
      {label}
    </button>
  );

  // Renderiza la barra de búsqueda y acciones
  const renderSearchBar = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
      alignItems: 'center'
    }}>
      <div style={{ flex: 1, marginRight: theme.spacing.md }}>
        <input
          type="text"
          placeholder={`Buscar ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.small,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background
          }}
        />
      </div>
      <Button variant="primary">
        <span style={{ marginRight: theme.spacing.xs }}>+</span> 
        {activeTab === 'usuarios' ? 'Nuevo Usuario' : 
         activeTab === 'materias' ? 'Nueva Materia' : 
         activeTab === 'departamentos' ? 'Nuevo Departamento' : 'Nuevo Elemento'}
      </Button>
    </div>
  );

  // Renderiza la tabla de usuarios
  const renderUsuariosTable = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.medium,
        overflow: 'hidden'
      }}>
        <thead>
          <tr style={{ backgroundColor: theme.colors.primary, color: 'white' }}>
            <th style={tableCellStyle(true)}>ID</th>
            <th style={tableCellStyle(true)}>Nombre</th>
            <th style={tableCellStyle(true)}>Email</th>
            <th style={tableCellStyle(true)}>Rol</th>
            <th style={tableCellStyle(true)}>Información</th>
            <th style={tableCellStyle(true)}>Estado</th>
            <th style={tableCellStyle(true)}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={user.id} style={{ 
              backgroundColor: index % 2 === 0 ? theme.colors.card : `${theme.colors.background}`
            }}>
              <td style={tableCellStyle()}>{user.id}</td>
              <td style={tableCellStyle()}>{user.nombre}</td>
              <td style={tableCellStyle()}>{user.email}</td>
              <td style={tableCellStyle()}>
                <span style={{
                  backgroundColor: user.rol === 'administrador' 
                    ? theme.colors.primary 
                    : user.rol === 'docente' 
                      ? theme.colors.info 
                      : theme.colors.success,
                  color: 'white',
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  borderRadius: theme.borderRadius.small,
                  fontSize: '0.8rem'
                }}>
                  {user.rol.toUpperCase()}
                </span>
              </td>
              <td style={tableCellStyle()}>
                {user.rol === 'estudiante' ? `Carrera: ${user.carrera}` : 
                 user.rol === 'docente' ? `Especialidad: ${user.especialidad}` : 
                 user.rol === 'administrador' ? `Depto: ${user.departamento}` : ''}
              </td>
              <td style={tableCellStyle()}>
                <span style={{
                  backgroundColor: user.estado === 'activo' ? theme.colors.success : theme.colors.notification,
                  color: 'white',
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  borderRadius: theme.borderRadius.small,
                  fontSize: '0.8rem'
                }}>
                  {user.estado.toUpperCase()}
                </span>
              </td>
              <td style={tableCellStyle()}>
                <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                  <ActionButton icon="✏️" label="Editar" />
                  <ActionButton icon={user.estado === 'activo' ? '🚫' : '✅'} 
                    label={user.estado === 'activo' ? 'Desactivar' : 'Activar'} />
                  <ActionButton icon="🗑️" label="Eliminar" variant="danger" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Renderiza la tabla de materias
  const renderMateriasTable = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.medium,
        overflow: 'hidden'
      }}>
        <thead>
          <tr style={{ backgroundColor: theme.colors.primary, color: 'white' }}>
            <th style={tableCellStyle(true)}>Código</th>
            <th style={tableCellStyle(true)}>Nombre</th>
            <th style={tableCellStyle(true)}>Docente</th>
            <th style={tableCellStyle(true)}>Departamento</th>
            <th style={tableCellStyle(true)}>Créditos</th>
            <th style={tableCellStyle(true)}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.map((course, index) => (
            <tr key={course.id} style={{ 
              backgroundColor: index % 2 === 0 ? theme.colors.card : `${theme.colors.background}`
            }}>
              <td style={tableCellStyle()}>{course.id}</td>
              <td style={tableCellStyle()}>{course.nombre}</td>
              <td style={tableCellStyle()}>{course.docente}</td>
              <td style={tableCellStyle()}>{course.departamento}</td>
              <td style={tableCellStyle()}>{course.créditos}</td>
              <td style={tableCellStyle()}>
                <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                  <ActionButton icon="✏️" label="Editar" />
                  <ActionButton icon="👥" label="Estudiantes" />
                  <ActionButton icon="🗑️" label="Eliminar" variant="danger" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Renderiza la tabla de departamentos
  const renderDepartamentosTable = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.medium,
        overflow: 'hidden'
      }}>
        <thead>
          <tr style={{ backgroundColor: theme.colors.primary, color: 'white' }}>
            <th style={tableCellStyle(true)}>ID</th>
            <th style={tableCellStyle(true)}>Nombre</th>
            <th style={tableCellStyle(true)}>Director</th>
            <th style={tableCellStyle(true)}>Facultad</th>
            <th style={tableCellStyle(true)}>Docentes</th>
            <th style={tableCellStyle(true)}>Materias</th>
            <th style={tableCellStyle(true)}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepartments.map((dept, index) => (
            <tr key={dept.id} style={{ 
              backgroundColor: index % 2 === 0 ? theme.colors.card : `${theme.colors.background}`
            }}>
              <td style={tableCellStyle()}>{dept.id}</td>
              <td style={tableCellStyle()}>{dept.nombre}</td>
              <td style={tableCellStyle()}>{dept.director}</td>
              <td style={tableCellStyle()}>{dept.facultad}</td>
              <td style={tableCellStyle()}>{dept.numDocentes}</td>
              <td style={tableCellStyle()}>{dept.numMaterias}</td>
              <td style={tableCellStyle()}>
                <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                  <ActionButton icon="✏️" label="Editar" />
                  <ActionButton icon="👥" label="Ver Docentes" />
                  <ActionButton icon="🗑️" label="Eliminar" variant="danger" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Componente para botones de acción en tablas
  const ActionButton = ({ icon, label, variant = 'default' }) => (
    <button
      title={label}
      style={{
        backgroundColor: variant === 'danger' 
          ? `${theme.colors.notification}15` 
          : variant === 'primary' 
            ? `${theme.colors.primary}15` 
            : `${theme.colors.text}15`,
        color: variant === 'danger' 
          ? theme.colors.notification 
          : variant === 'primary' 
            ? theme.colors.primary 
            : theme.colors.text,
        border: 'none',
        borderRadius: theme.borderRadius.small,
        padding: theme.spacing.xs,
        cursor: 'pointer',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {icon}
    </button>
  );

  // Función de utilidad para el estilo de las celdas de la tabla
  const tableCellStyle = (isHeader = false) => ({
    padding: theme.spacing.md,
    textAlign: isHeader ? 'left' : 'left',
    fontWeight: isHeader ? 'bold' : 'normal',
    borderBottom: `1px solid ${theme.colors.border}`
  });

  // Renderiza la sección de reportes
  const renderReportes = () => (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.lg
      }}>
        <StatCard 
          title="Usuarios Activos" 
          value="1,234" 
          icon="👥"
          color={theme.colors.success}
        />
        <StatCard 
          title="Materias Activas" 
          value="87" 
          icon="📚"
          color={theme.colors.info}
        />
        <StatCard 
          title="Publicaciones Hoy" 
          value="56" 
          icon="📝"
          color={theme.colors.primary}
        />
        <StatCard 
          title="Viajes Compartidos" 
          value="23" 
          icon="🚗"
          color={theme.colors.accent}
        />
      </div>

      <div style={{ display: 'flex', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
        <Card style={{ flex: '1 1 45%', minWidth: '300px' }}>
          <Heading level={3}>Tipos de Usuarios</Heading>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: theme.spacing.md,
            marginTop: theme.spacing.md
          }}>
            <ProgressBar label="Estudiantes" value={68} color={theme.colors.success} />
            <ProgressBar label="Docentes" value={22} color={theme.colors.info} />
            <ProgressBar label="Administradores" value={10} color={theme.colors.primary} />
          </div>
        </Card>
        
        <Card style={{ flex: '1 1 45%', minWidth: '300px' }}>
          <Heading level={3}>Actividad por Módulo</Heading>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: theme.spacing.md,
            marginTop: theme.spacing.md
          }}>
            <ProgressBar label="Social" value={45} color="#FF6B6B" />
            <ProgressBar label="Académico" value={32} color="#4ECDC4" />
            <ProgressBar label="Carpooling" value={23} color="#FFD166" />
          </div>
        </Card>
      </div>
      
      <Card style={{ marginTop: theme.spacing.lg }}>
        <Heading level={3}>Últimos Eventos</Heading>
        <ul style={{ 
          listStyleType: 'none', 
          padding: 0,
          margin: 0,
          marginTop: theme.spacing.md
        }}>
          {[
            { time: '10:23', text: 'Usuario nuevo registrado: Ana Martinez', icon: '👤' },
            { time: '09:45', text: 'Reporte generado: Estadísticas de Octubre', icon: '📊' },
            { time: '09:12', text: 'Nueva materia creada: Inteligencia Artificial Avanzada', icon: '📚' },
            { time: '08:55', text: 'Usuario modificado: Carlos Pérez', icon: '✏️' },
            { time: '08:30', text: 'Respaldo del sistema realizado con éxito', icon: '💾' }
          ].map((event, index) => (
            <li key={index} style={{ 
              padding: theme.spacing.md,
              borderBottom: index < 4 ? `1px solid ${theme.colors.border}` : 'none',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{ 
                marginRight: theme.spacing.md,
                width: '40px',
                height: '40px',
                backgroundColor: `${theme.colors.primary}15`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                {event.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div>{event.text}</div>
                <div style={{ fontSize: '0.8rem', color: theme.colors.textLight }}>{event.time}</div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );

  // Renderiza la sección de configuración
  const renderConfiguracion = () => (
    <div>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Heading level={3}>Configuraciones del Sistema</Heading>
        <Divider margin="md" />
        
        <div style={{ marginBottom: theme.spacing.lg }}>
          <Heading level={4}>Configuración General</Heading>
          
          <div style={{ marginBottom: theme.spacing.md }}>
            <label style={{ 
              display: 'block', 
              marginBottom: theme.spacing.xs,
              fontWeight: '500'
            }}>
              Nombre de la Institución
            </label>
            <input
              type="text"
              defaultValue="Universidad del Valle Bolivia"
              style={{
                width: '100%',
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.small,
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.background
              }}
            />
          </div>
          
          <div style={{ marginBottom: theme.spacing.md }}>
            <label style={{ 
              display: 'block', 
              marginBottom: theme.spacing.xs,
              fontWeight: '500'
            }}>
              Logotipo de la Institución
            </label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: theme.spacing.md 
            }}>
              <img 
                src="https://storage.googleapis.com/copilot-img-chat/6fc0e9ae-dbf9-432d-9b5f-b5e9fc07c605.png" 
                alt="Logo Actual" 
                style={{ 
                  height: '60px',
                  border: `1px solid ${theme.colors.border}`,
                  padding: theme.spacing.xs
                }} 
              />
              <Button variant="secondary">Cambiar logo</Button>
            </div>
          </div>
          
          <div style={{ marginBottom: theme.spacing.md }}>
            <label style={{ 
              display: 'block', 
              marginBottom: theme.spacing.xs,
              fontWeight: '500'
            }}>
              Colores Institucionales
            </label>
            <div style={{ 
              display: 'flex', 
              gap: theme.spacing.md 
            }}>
              <div>
                <label style={{ fontSize: '0.9rem' }}>Color Principal</label>
                <input 
                  type="color" 
                  defaultValue="#8B1E41"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: 0,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.small
                  }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.9rem' }}>Color Secundario</label>
                <input 
                  type="color" 
                  defaultValue="#333333"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: 0,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.small
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
        
        <Divider margin="md" />
        
        <div style={{ marginBottom: theme.spacing.lg }}>
          <Heading level={4}>Configuración de Módulos</Heading>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: theme.spacing.md
          }}>
            <ModuleToggle name="Social" isActive={true} />
            <ModuleToggle name="Académico" isActive={true} />
            <ModuleToggle name="Carpooling" isActive={true} />
            <ModuleToggle name="Biblioteca" isActive={false} />
            <ModuleToggle name="Eventos" isActive={false} />
            <ModuleToggle name="Trámites" isActive={false} />
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <Button variant="primary">Guardar Cambios</Button>
        </div>
      </Card>
      
      <Card>
        <Heading level={3}>Respaldo y Restauración</Heading>
        <Divider margin="md" />
        
        <div style={{ display: 'flex', gap: theme.spacing.lg, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <Heading level={4}>Respaldo de Base de Datos</Heading>
            <p style={{ color: theme.colors.textLight }}>
              Genera un respaldo completo de todos los datos del sistema
            </p>
            <Button variant="info">Generar Respaldo</Button>
          </div>
          
          <div style={{ flex: 1, minWidth: '250px' }}>
            <Heading level={4}>Restaurar Base de Datos</Heading>
            <p style={{ color: theme.colors.textLight }}>
              Restaura los datos desde un respaldo previo
            </p>
            <Button variant="secondary">Seleccionar Archivo</Button>
          </div>
        </div>
      </Card>
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

  // Componente para barras de progreso
  const ProgressBar = ({ label, value, color }) => (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs
      }}>
        <span>{label}</span>
        <span style={{ fontWeight: 'bold' }}>{value}%</span>
      </div>
      <div style={{ 
        height: '8px', 
        backgroundColor: `${color}20`,
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden'
      }}>
        <div style={{ 
          height: '100%', 
          width: `${value}%`, 
          backgroundColor: color
        }} />
      </div>
    </div>
  );

  // Componente para toggles de módulos
  const ModuleToggle = ({ name, isActive }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.small,
      border: `1px solid ${theme.colors.border}`
    }}>
      <label style={{ 
        display: 'flex', 
        alignItems: 'center',
        cursor: 'pointer',
        flex: 1
      }}>
        <input 
          type="checkbox" 
          defaultChecked={isActive} 
          style={{ marginRight: theme.spacing.sm }}
        />
        <span>{name}</span>
      </label>
      <span style={{
        backgroundColor: isActive ? theme.colors.success : theme.colors.textLight,
        color: 'white',
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        borderRadius: theme.borderRadius.small,
        fontSize: '0.7rem'
      }}>
        {isActive ? 'ACTIVO' : 'INACTIVO'}
      </span>
    </div>
  );

  return (
    <div style={{ padding: theme.spacing.lg }}>
      <Heading level={1} style={{ marginBottom: theme.spacing.md }}>
        Panel de Administración
      </Heading>
      
      <p style={{ 
        color: theme.colors.textLight, 
        marginBottom: theme.spacing.lg,
        fontSize: '1.1rem'
      }}>
        Bienvenido, {user.nombre}. Administra usuarios, materias y otros elementos del sistema.
      </p>
      
      {renderTabs()}
      {renderSearchBar()}
      
      {activeTab === 'usuarios' && renderUsuariosTable()}
      {activeTab === 'materias' && renderMateriasTable()}
      {activeTab === 'departamentos' && renderDepartamentosTable()}
      {activeTab === 'reportes' && renderReportes()}
      {activeTab === 'configuracion' && renderConfiguracion()}
    </div>
  );
};

export default AdminPanel;