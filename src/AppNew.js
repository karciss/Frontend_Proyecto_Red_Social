import React, { useState } from 'react';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { WeeklyCalendar, PerformanceChart, GradesTable, CourseCard } from './components/AcademicComponents';
import { CreatePostForm, SocialPost, GroupChat } from './components/SocialComponents';
import { RouteCard, RoutesMap, CreateRouteForm, MyRoutesAsDriver } from './components/CarpoolingComponents';

// Logo de la universidad
const UniversityLogo = () => {
  return (
    <img 
      src="/univalle_logo.png" 
      alt="Universidad del Valle Bolivia" 
      style={{ height: '40px', marginRight: '10px' }}
      onError={(e) => {
        e.target.onerror = null;
        e.target.style.display = 'none';
      }}
    />
  );
};

// Componente de encabezado
const Header = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  
  return (
    <header style={{ 
      backgroundColor: theme.colors.card,
      padding: '15px 20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <UniversityLogo />
        <h1 style={{ 
          color: theme.colors.primary, 
          margin: 0, 
          fontSize: '1.5rem',
          fontWeight: 'bold' 
        }}>
          Red Social Universitaria
        </h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {user && (
          <>
            <span style={{ marginRight: '15px', color: theme.colors.text }}>
              Hola, {user.nombre || 'Usuario'}
            </span>
            <button 
              onClick={logout}
              style={{
                padding: '8px 16px',
                backgroundColor: theme.colors.secondary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                marginRight: '10px',
                cursor: 'pointer'
              }}
            >
              Cerrar Sesión
            </button>
          </>
        )}
        <button 
          onClick={toggleTheme}
          style={{
            padding: '8px 16px',
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </button>
      </div>
    </header>
  );
};

// Componente de navegación
const Navigation = ({ activeTab, setActiveTab }) => {
  const { theme } = useTheme();
  
  const tabs = [
    { id: 'academic', label: 'Académico', icon: '📚' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'carpooling', label: 'Carpooling', icon: '🚗' }
  ];
  
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '15px',
      backgroundColor: theme.colors.card,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              backgroundColor: isActive ? theme.colors.primary : 'transparent',
              color: isActive ? 'white' : theme.colors.text,
              border: 'none',
              borderRadius: '8px',
              padding: '12px 25px',
              margin: '0 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: isActive ? 'bold' : 'normal',
              boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '20px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

// Módulo Académico
const AcademicModule = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('schedule');
  
  // Datos de ejemplo para el horario
  const sampleSchedule = [
    { day: 'Lunes', time: '08:00', course: 'Desarrollo Web Avanzado', room: 'Lab 3', professor: 'Dr. Carlos Mendoza' },
    { day: 'Lunes', time: '10:00', course: 'Desarrollo Móvil', room: 'Lab 5', professor: 'Ing. Roberto Salinas' },
    { day: 'Martes', time: '14:00', course: 'Inteligencia Artificial', room: '304', professor: 'Dra. Laura Espinoza' },
    { day: 'Miércoles', time: '08:00', course: 'Desarrollo Web Avanzado', room: 'Lab 3', professor: 'Dr. Carlos Mendoza' },
    { day: 'Jueves', time: '10:00', course: 'Estadística para Informática', room: '201', professor: 'Lic. Patricia Rojas' },
    { day: 'Jueves', time: '14:00', course: 'Inteligencia Artificial', room: '304', professor: 'Dra. Laura Espinoza' },
    { day: 'Viernes', time: '14:00', course: 'Desarrollo Móvil', room: 'Lab 5', professor: 'Ing. Roberto Salinas' }
  ];
  
  // Datos de ejemplo para calificaciones
  const sampleGrades = [
    { code: 'INF-310', name: 'Desarrollo Web Avanzado', exam1: 85, exam2: 90, final: 88, average: 87.7 },
    { code: 'INF-315', name: 'Inteligencia Artificial', exam1: 78, exam2: 85, final: 92, average: 85.0 },
    { code: 'INF-320', name: 'Desarrollo Móvil', exam1: 90, exam2: 88, final: 95, average: 91.0 },
    { code: 'MAT-250', name: 'Estadística para Informática', exam1: 75, exam2: 80, final: 82, average: 79.0 }
  ];
  
  // Datos de ejemplo para gráficos
  const performanceData = [
    { label: 'INF-310', value: 87 },
    { label: 'INF-315', value: 85 },
    { label: 'INF-320', value: 91 },
    { label: 'MAT-250', value: 79 }
  ];
  
  // Datos de ejemplo para cursos
  const sampleCourses = [
    {
      id: 1,
      code: 'INF-310',
      name: 'Desarrollo Web Avanzado',
      professor: 'Dr. Carlos Mendoza',
      group: 'A',
      schedule: [
        { day: 'Lunes', time: '08:00 - 10:00', room: 'Lab 3' },
        { day: 'Miércoles', time: '08:00 - 10:00', room: 'Lab 3' }
      ]
    },
    {
      id: 2,
      code: 'INF-315',
      name: 'Inteligencia Artificial',
      professor: 'Dra. Laura Espinoza',
      group: 'B',
      schedule: [
        { day: 'Martes', time: '14:00 - 16:00', room: '304' },
        { day: 'Jueves', time: '14:00 - 16:00', room: '304' }
      ]
    },
    {
      id: 3,
      code: 'INF-320',
      name: 'Desarrollo Móvil',
      professor: 'Ing. Roberto Salinas',
      group: 'A',
      schedule: [
        { day: 'Lunes', time: '10:00 - 12:00', room: 'Lab 5' },
        { day: 'Viernes', time: '14:00 - 16:00', room: 'Lab 5' }
      ]
    },
    {
      id: 4,
      code: 'MAT-250',
      name: 'Estadística para Informática',
      professor: 'Lic. Patricia Rojas',
      group: 'C',
      schedule: [
        { day: 'Martes', time: '10:00 - 12:00', room: '201' },
        { day: 'Jueves', time: '10:00 - 12:00', room: '201' }
      ]
    }
  ];
  
  const tabs = [
    { id: 'schedule', label: 'Horario Semanal' },
    { id: 'grades', label: 'Calificaciones' },
    { id: 'courses', label: 'Mis Materias' }
  ];
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ 
        color: theme.colors.primary, 
        marginBottom: '20px', 
        textAlign: 'center',
        borderBottom: `2px solid ${theme.colors.primary}`,
        paddingBottom: '10px'
      }}>
        Módulo Académico
      </h2>
      
      {/* Navegación secundaria */}
      <div style={{
        backgroundColor: theme.colors.card,
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            style={{
              backgroundColor: activeSection === tab.id ? theme.colors.primary : theme.colors.card,
              color: activeSection === tab.id ? 'white' : theme.colors.text,
              border: 'none',
              padding: '10px 20px',
              margin: '5px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: activeSection === tab.id ? 'bold' : 'normal',
              boxShadow: activeSection === tab.id ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Contenido de las secciones */}
      {activeSection === 'schedule' && (
        <WeeklyCalendar schedule={sampleSchedule} />
      )}
      
      {activeSection === 'grades' && (
        <div>
          <GradesTable grades={sampleGrades} />
          <div style={{ marginTop: '30px' }}>
            <PerformanceChart data={performanceData} />
          </div>
        </div>
      )}
      
      {activeSection === 'courses' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {sampleCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

// Módulo Social
const SocialModule = () => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'María López',
      avatarText: 'ML',
      time: '5 min',
      content: 'Acabo de terminar el proyecto final de Desarrollo Web Avanzado. ¡Qué alivio! Ahora a estudiar para el examen de Inteligencia Artificial 🤖.',
      likes: 15,
      comments: 3,
      liked: true,
      showComments: false,
      commentList: [
        { user: 'Juan Pérez', time: '3 min', content: '¡Felicidades! Yo también estoy terminando mi proyecto.' },
        { user: 'Ana García', time: '1 min', content: '¿Podrías compartir tus apuntes de IA?' }
      ]
    },
    {
      id: 2,
      user: 'Juan Pérez',
      avatarText: 'JP',
      time: '25 min',
      content: '¿Alguien tiene los apuntes de la clase de Estadística? Me perdí la clase del martes 📊.',
      likes: 5,
      comments: 7,
      liked: false,
      showComments: false
    },
    {
      id: 3,
      user: 'Carlos Rodríguez',
      avatarText: 'CR',
      time: '1 h',
      content: 'Recordatorio: La entrega del proyecto de Desarrollo Móvil es este viernes. No lo olviden! 📱',
      image: 'https://placehold.co/600x400/png?text=Imagen+de+ejemplo+del+proyecto',
      likes: 23,
      comments: 12,
      liked: false,
      showComments: false
    }
  ]);
  
  // Datos de ejemplo para chat grupal
  const sampleChat = {
    id: 1,
    name: 'Grupo Desarrollo Web Avanzado',
    participants: 28,
    icon: '👨‍💻',
    messages: [
      { user: 'María López', text: 'Hola a todos! Alguien ya empezó el proyecto final?', time: '10:30' },
      { user: 'Juan Pérez', text: 'Yo estoy trabajando en la estructura de la base de datos', time: '10:32' },
      { user: 'Ana García', text: 'Yo apenas estoy revisando los requerimientos 😅', time: '10:35' },
      { user: 'Carlos Ramírez', text: 'Podríamos reunirnos esta tarde para discutir ideas?', time: '10:38' },
      { user: 'Sofía Martínez', text: 'A mi me parece bien, estoy disponible después de las 4pm', time: '10:40' },
      { user: 'Yo', text: 'Yo también me uno a la reunión!', time: '10:42' }
    ]
  };
  
  // Función para manejar interacciones con posts
  const toggleComments = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, showComments: !post.showComments } : post
    ));
  };
  
  const toggleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { 
        ...post, 
        liked: !post.liked, 
        likes: post.liked ? post.likes - 1 : post.likes + 1 
      } : post
    ));
  };
  
  return (
    <div style={{ 
      padding: '20px',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div>
        <h2 style={{ 
          color: theme.colors.primary, 
          marginBottom: '20px', 
          textAlign: 'center',
          borderBottom: `2px solid ${theme.colors.primary}`,
          paddingBottom: '10px'
        }}>
          Publicaciones
        </h2>
        
        <CreatePostForm onSubmit={() => console.log('Crear post')} />
        
        {posts.map(post => (
          <SocialPost 
            key={post.id} 
            post={post} 
            onLike={() => toggleLike(post.id)} 
            onComment={() => toggleComments(post.id)}
            onShare={() => console.log('Compartir', post.id)}
          />
        ))}
      </div>
      
      <div>
        <h2 style={{ 
          color: theme.colors.primary, 
          marginBottom: '20px', 
          textAlign: 'center',
          borderBottom: `2px solid ${theme.colors.primary}`,
          paddingBottom: '10px'
        }}>
          Chat Grupal
        </h2>
        
        <GroupChat chat={sampleChat} />
      </div>
    </div>
  );
};

// Módulo Carpooling
const CarpoolingModule = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('routes');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Datos de ejemplo para rutas de carpooling
  const sampleRoutes = [
    { 
      id: 1, 
      driver: 'María López', 
      origin: 'Zona Sur', 
      destination: 'Campus Universidad', 
      time: '07:30', 
      days: ['Lunes', 'Miércoles', 'Viernes'],
      capacity: 4,
      occupiedSeats: 2,
      stops: [
        { name: 'Plaza San Miguel', time: '07:15' },
        { name: 'Avenida Las Américas', time: '07:25' }
      ] 
    },
    { 
      id: 2, 
      driver: 'Carlos Gutiérrez', 
      origin: 'Zona Norte', 
      destination: 'Campus Universidad', 
      time: '08:00', 
      days: ['Lunes', 'Martes', 'Jueves'],
      capacity: 3,
      occupiedSeats: 3,
      stops: [
        { name: 'Plaza Principal', time: '07:40' },
        { name: 'Parque Central', time: '07:50' }
      ] 
    },
    { 
      id: 3, 
      driver: 'Ana Martínez', 
      origin: 'Zona Este', 
      destination: 'Campus Universidad', 
      time: '07:45', 
      days: ['Martes', 'Jueves', 'Viernes'],
      capacity: 4,
      occupiedSeats: 1,
      stops: [
        { name: 'Centro Comercial Este', time: '07:30' },
        { name: 'Terminal de Buses', time: '07:40' }
      ] 
    }
  ];
  
  // Datos de ejemplo para mis rutas como conductor
  const myDriverRoutes = [
    {
      id: 1,
      origin: 'Zona Norte',
      destination: 'Campus Universidad',
      time: '08:00',
      days: ['Lunes', 'Martes', 'Jueves'],
      capacity: 4,
      occupiedSeats: 3,
      active: true,
      passengers: [
        { name: 'Ana García', joinLocation: 'Plaza Principal' },
        { name: 'Juan Pérez', joinLocation: 'Parque Central' }
      ],
      requests: [
        { id: 1, name: 'Marco Rojas', joinLocation: 'Zona Norte' }
      ]
    }
  ];
  
  const tabs = [
    { id: 'routes', label: 'Rutas Disponibles' },
    { id: 'map', label: 'Ver Mapa' }
  ];
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ 
        color: theme.colors.primary, 
        marginBottom: '20px', 
        textAlign: 'center',
        borderBottom: `2px solid ${theme.colors.primary}`,
        paddingBottom: '10px'
      }}>
        Módulo Carpooling
      </h2>
      
      {/* Navegación secundaria */}
      <div style={{
        backgroundColor: theme.colors.card,
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSection(tab.id);
              if (showCreateForm) setShowCreateForm(false);
            }}
            style={{
              backgroundColor: activeSection === tab.id ? theme.colors.primary : theme.colors.card,
              color: activeSection === tab.id ? 'white' : theme.colors.text,
              border: 'none',
              padding: '10px 20px',
              margin: '5px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: activeSection === tab.id ? 'bold' : 'normal',
              boxShadow: activeSection === tab.id ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Contenido de las secciones */}
      {activeSection === 'routes' && !showCreateForm && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '20px'
          }}>
            <button 
              onClick={() => setShowCreateForm(true)}
              style={{
                backgroundColor: theme.colors.primary,
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 'bold'
              }}
            >
              <span style={{ marginRight: '5px', fontSize: '16px' }}>+</span> Nueva Ruta
            </button>
          </div>
          
          {sampleRoutes.map(route => (
            <RouteCard 
              key={route.id} 
              route={route}
              onViewMap={() => console.log('Ver mapa de ruta', route.id)}
            />
          ))}
        </div>
      )}
      
      {activeSection === 'routes' && showCreateForm && (
        <CreateRouteForm 
          onSubmit={() => {
            console.log('Crear nueva ruta');
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
      
      {activeSection === 'map' && (
        <RoutesMap routes={sampleRoutes} />
      )}
    </div>
  );
};

// Componente de formulario de inicio de sesión
const LoginForm = () => {
  const { theme } = useTheme();
  const { login } = useAuth();
  
  const handleLogin = () => {
    login({
      id: 'user-123',
      nombre: 'Usuario de Prueba',
      email: 'usuario@univalle.edu',
      rol: 'estudiante'
    });
  };
  
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '400px',
        backgroundColor: theme.colors.card,
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <UniversityLogo />
        </div>
        
        <h1 style={{ color: theme.colors.primary, marginBottom: '20px', textAlign: 'center' }}>
          Red Social Universitaria
        </h1>
        
        <h3 style={{ color: theme.colors.text, marginBottom: '30px', textAlign: 'center' }}>
          Plataforma para estudiantes universitarios
        </h3>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block',
            marginBottom: '8px',
            color: theme.colors.text,
            fontWeight: 'bold'
          }}>
            Email
          </label>
          <input 
            type="email" 
            placeholder="usuario@univalle.edu"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.background,
              color: theme.colors.text
            }}
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block',
            marginBottom: '8px',
            color: theme.colors.text,
            fontWeight: 'bold'
          }}>
            Contraseña
          </label>
          <input 
            type="password" 
            placeholder="Contraseña"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.background,
              color: theme.colors.text
            }}
          />
          <div style={{ 
            textAlign: 'right', 
            marginTop: '5px'
          }}>
            <a 
              href="#" 
              style={{
                color: theme.colors.primary,
                textDecoration: 'none'
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
        
        <button 
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            marginBottom: '15px'
          }}
        >
          Iniciar Sesión
        </button>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          borderTop: `1px solid ${theme.colors.border}`,
          textAlign: 'center'
        }}>
          <p style={{ 
            color: theme.colors.text, 
            fontSize: '14px'
          }}>
            Versión prototipo - Haz clic en "Iniciar Sesión" para acceder directamente
          </p>
        </div>
      </div>
    </div>
  );
};

// Footer compartido
const Footer = () => {
  const { theme } = useTheme();
  
  return (
    <footer style={{ 
      backgroundColor: theme.colors.footerBg || theme.colors.card,
      padding: '20px',
      textAlign: 'center',
      color: theme.colors.text,
      borderTop: `1px solid ${theme.colors.border}`,
      marginTop: '30px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: '15px' 
      }}>
        <UniversityLogo />
        <span style={{ fontWeight: 'bold', color: theme.colors.primary }}>Universidad del Valle Bolivia</span>
      </div>
      <div style={{ color: theme.colors.textLight, fontSize: '0.9rem' }}>
        Red Social Universitaria © {new Date().getFullYear()} - Todos los derechos reservados
      </div>
    </footer>
  );
};

// Componente principal
const MainApp = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('academic');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontFamily: theme.fonts.body
    }}>
      <Header />
      
      {user ? (
        <>
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {activeTab === 'academic' && <AcademicModule />}
          {activeTab === 'social' && <SocialModule />}
          {activeTab === 'carpooling' && <CarpoolingModule />}
        </>
      ) : (
        <LoginForm />
      )}
      
      <Footer />
    </div>
  );
};

// App con Providers
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
