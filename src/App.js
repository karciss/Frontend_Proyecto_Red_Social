import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import SocialModule from './components/SocialModule';
import AcademicModule from './components/AcademicModule';
import CarpoolingModule from './components/CarpoolingModule';
import MessagesModule from './components/MessagesModule';
import NotificationsModule from './components/NotificationsModule';
import SettingsModule from './components/SettingsModule';
import AmigosModule from './components/AmigosModule';
import LoginForm from './components/LoginForm';
import ThemeController from './components/ThemeController';
import websocketConfig from './services/websocketConfig';
import './styles.css';
import './styles/globalStyles.css';
import './styles/app.css';
import './styles/themes.css';

const App = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeModule, setActiveModule] = useState('social');
  const [socket, setSocket] = useState(null);

  // Inicializar la conexión WebSocket
  useEffect(() => {
    // Suprimir errores de WebSocket para evitar mensajes en consola
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('WebSocket')) {
        // Suprimimos los errores de WebSocket en la consola
        return;
      }
      originalConsoleError.apply(console, args);
    };

    // Intentar establecer conexión WebSocket
    try {
      const newSocket = websocketConfig.createConnection();
      setSocket(newSocket);
    } catch (error) {
      // Manejar silenciosamente
    }

    // Restaurar console.error al desmontar el componente
    return () => {
      console.error = originalConsoleError;
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Función para manejar el cambio de módulo desde el Sidebar
  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
    console.log('Módulo cambiado a:', moduleId);
    // Cambiamos el contenido principal según el módulo seleccionado
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeController />
        <AuthContent activeModule={activeModule} setActiveModule={handleModuleChange} />
      </AuthProvider>
    </ThemeProvider>
  );
};

// Componente que muestra contenido según el estado de autenticación
const AuthContent = ({ activeModule, setActiveModule }) => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);

  // Renderiza el módulo activo
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'social':
        return <SocialModule onSelectItem={setSelectedItem} selectedItem={selectedItem} />;
      case 'academic':
        return <AcademicModule onSelectItem={setSelectedItem} selectedItem={selectedItem} />;
      case 'carpooling':
        return <CarpoolingModule onSelectItem={setSelectedItem} selectedItem={selectedItem} />;
      case 'amigos':
        return <AmigosModule onSelectItem={setSelectedItem} selectedItem={selectedItem} />;
      case 'messages':
        return <MessagesModule onSelectItem={setSelectedItem} selectedItem={selectedItem} />;
      case 'notifications':
        return <NotificationsModule onSelectItem={setSelectedItem} selectedItem={selectedItem} />;
      case 'settings':
        return <SettingsModule onSelectItem={setSelectedItem} selectedItem={selectedItem} />;
      default:
        return <SocialModule onSelectItem={setSelectedItem} selectedItem={selectedItem} />;
    }
  };

  // Si el usuario está autenticado, mostrar el contenido principal
  if (user) {
    return (
      <div className="app-container">
        {/* Sidebar con solo iconos y perfil de usuario integrado */}
        <Sidebar onModuleChange={setActiveModule} activeModule={activeModule} />
        <div className="main-content" style={{ marginLeft: "80px" }}>
          {renderActiveModule()}
        </div>
      </div>
    );
  }
  
  // Si no hay usuario autenticado, mostrar formulario de login
  return (
    <div className="login-container">
      <LoginForm />
    </div>
  );
};

export default App;