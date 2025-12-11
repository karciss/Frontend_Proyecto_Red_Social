import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';

// Importar pantallas
// Importamos las pantallas existentes
import AcademicScheduleScreen from '../screens/AcademicScheduleScreen';
import SocialFeedScreen from '../screens/SocialFeedScreen';
import CarpoolingScreen from '../screens/CarpoolingScreen';
import UserSettingsScreen from '../screens/UserSettingsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';

// Pantallas pendientes de implementar
const HomeScreen = () => {
  const { theme } = useTheme();
  return <div style={{ color: theme.colors.text }}>Pantalla de Inicio</div>;
};
const AcademicGradesScreen = () => {
  const { theme } = useTheme();
  return <div style={{ color: theme.colors.text }}>Calificaciones</div>;
};
const MessagesScreen = () => {
  const { theme } = useTheme();
  return <div style={{ color: theme.colors.text }}>Mensajes</div>;
};

// Importar pantalla de navegación principal
import MainNavigationScreen from '../screens/MainNavigationScreen';

// Ruta protegida que requiere autenticación
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: theme.colors.background,
        color: theme.colors.text
      }}>
        Cargando...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componentes de layout
const Layout = ({ children }) => {
  const { theme } = useTheme();
  return (
    <div style={{ 
      backgroundColor: theme.colors.background,
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {children}
    </div>
  );
};
const MainLayout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState('social');

  // Manejador para cambiar entre módulos
  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
    
    // Navegar a las rutas correspondientes según el módulo seleccionado
    switch (moduleId) {
      case 'social':
        window.location.href = '/social/feed';
        break;
      case 'academic':
        window.location.href = '/academic/schedule';
        break;
      case 'carpooling':
        window.location.href = '/carpooling/routes';
        break;
      case 'messages':
        window.location.href = '/social/messages';
        break;
      case 'notifications':
        // Ruta pendiente
        break;
      case 'settings':
        window.location.href = '/settings';
        break;
      default:
        window.location.href = '/';
    }
  };
  
  return (
    <div style={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme.colors.background
    }}>
      {/* Sidebar */}
      <Sidebar onModuleChange={handleModuleChange} />

      {/* Contenido principal */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1 
      }}>
        {/* Header */}
        <header style={{ 
          backgroundColor: theme.colors.card,
          padding: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              color: theme.colors.text, 
              margin: 0, 
              fontSize: '1.5rem' 
            }}>
              Red Social Universitaria
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button 
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                color: theme.colors.text,
                cursor: 'pointer',
                padding: '8px',
                fontSize: '1rem'
              }}
            >
              {theme.name === 'dark' ? '🔆' : '🌙'}
            </button>
            <span style={{ color: theme.colors.text }}>
              {user?.nombre || 'Usuario'}
            </span>
            <button 
              onClick={logout}
              style={{
                backgroundColor: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer'
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </header>
        
        {/* Contenido principal */}
        <main style={{ flex: 1, padding: '20px' }}>
          {children}
        </main>
        
        {/* Footer */}
        <footer style={{ 
          backgroundColor: theme.colors.card,
          padding: '16px',
          textAlign: 'center',
          color: theme.colors.secondary,
          fontSize: '0.9rem'
        }}>
          Red Social Universitaria © 2025 - Todos los derechos reservados
        </footer>
      </div>
    </div>
  );
};

// Pantallas de autenticación
const LoginScreen = () => {
  const { login } = useAuth();
  const { theme } = useTheme();
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: theme.colors.background,
      color: theme.colors.text
    }}>
      <h2>Iniciar Sesión</h2>
      <button 
        onClick={() => login({ id: 'user-123', nombre: 'Usuario de Prueba' })}
        style={{
          backgroundColor: theme.colors.primary,
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          marginTop: '20px',
          cursor: 'pointer'
        }}
      >
        Iniciar sesión como usuario de prueba
      </button>
    </div>
  );
};

const RegisterScreen = () => {
  const { theme } = useTheme();
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: theme.colors.background,
      color: theme.colors.text
    }}>
      <h2>Registro</h2>
      <p>Implementación pendiente</p>
    </div>
  );
};

// El componente LoginScreen ya está definido arriba

const AppNavigator = () => {
  const { theme } = useTheme();

  // Aplicar estilos globales
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = 'Roboto, sans-serif';
    document.body.style.backgroundColor = theme.colors.background;
  }, [theme]);

  return (
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <MainNavigationScreen />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Módulo Académico */}
        <Route path="/academic/schedule" element={
          <ProtectedRoute>
            <MainLayout>
              <AcademicScheduleScreen />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/academic/grades" element={
          <ProtectedRoute>
            <MainLayout>
              <AcademicGradesScreen />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Módulo Social */}
        <Route path="/social/feed" element={
          <ProtectedRoute>
            <MainLayout>
              <SocialFeedScreen />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/social/messages" element={
          <ProtectedRoute>
            <MainLayout>
              <MessagesScreen />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Módulo Carpooling */}
        <Route path="/carpooling/routes" element={
          <ProtectedRoute>
            <MainLayout>
              <CarpoolingScreen />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Módulo de Configuración */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout>
              <UserSettingsScreen />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Perfil de Usuario */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout>
              <UserProfileScreen />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
};

export default AppNavigator;
