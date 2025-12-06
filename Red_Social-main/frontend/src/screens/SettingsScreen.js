import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import '../styles/SettingsScreen.css';
import '../styles/ThemeOptions.css';

const SettingsScreen = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const [fontSize, setFontSize] = useState(3); // 1-5 scale for font size
  const [activeTab, setActiveTab] = useState('apariencia');

  const tabs = [
    { id: 'cuenta', icon: '🔑', label: 'Cuenta' },
    { id: 'apariencia', icon: '🎨', label: 'Apariencia' },
    { id: 'notificaciones', icon: '🔔', label: 'Notificaciones' },
    { id: 'privacidad', icon: '🔒', label: 'Privacidad' }
  ];

  // Handler para cambiar el tamaño de la fuente
  const handleFontSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setFontSize(newSize);
    // Aquí puedes implementar la lógica para cambiar el tamaño de fuente en la aplicación
    document.documentElement.style.setProperty('--font-size-factor', 0.9 + (newSize * 0.1));
  };

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <div className="settings-logo">RSU</div>
        <h1>Configuración</h1>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </div>
          ))}
          
          <div className="settings-tab logout">
            <span className="tab-icon">🚪</span>
            <span className="tab-label">Cerrar Sesión</span>
          </div>
        </div>

        <div className="settings-main">
          {activeTab === 'apariencia' && (
            <div className="settings-section">
              <h2>Apariencia</h2>

              <div className="settings-group">
                <h3>Tema</h3>
                <div className="theme-options">
                  {/* Tema Claro */}
                  <div 
                    className={`theme-option light-theme ${!isDarkMode ? 'active' : ''}`} 
                    onClick={() => {
                      if (isDarkMode) toggleTheme();
                    }}
                  >
                    <div className="theme-preview">
                      <div className="theme-preview-inner light">
                        <div className="preview-header"></div>
                        <div className="preview-content">
                          <div className="preview-line"></div>
                          <div className="preview-line short"></div>
                        </div>
                      </div>
                    </div>
                    <p>Tema Claro</p>
                    {!isDarkMode && <div className="theme-check">✓</div>}
                  </div>

                  {/* Tema Oscuro */}
                  <div 
                    className={`theme-option dark-theme ${isDarkMode ? 'active' : ''}`} 
                    onClick={() => {
                      if (!isDarkMode) toggleTheme();
                    }}
                  >
                    <div className="theme-preview">
                      <div className="theme-preview-inner dark">
                        <div className="preview-header"></div>
                        <div className="preview-content">
                          <div className="preview-line"></div>
                          <div className="preview-line short"></div>
                        </div>
                      </div>
                    </div>
                    <p>Tema Oscuro</p>
                    {isDarkMode && <div className="theme-check">✓</div>}
                  </div>

                  {/* Tema Colorido (próximamente) */}
                  <div className="theme-option colorful-theme disabled">
                    <div className="theme-preview">
                      <div className="theme-preview-inner colorful">
                        <div className="preview-header"></div>
                        <div className="preview-content">
                          <div className="preview-line"></div>
                          <div className="preview-line short"></div>
                        </div>
                      </div>
                    </div>
                    <p>Colorido</p>
                    <div className="coming-soon">Próximamente</div>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h3>Tamaño de texto</h3>
                <div className="font-size-control">
                  <span className="font-size-small">A</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={fontSize} 
                    onChange={handleFontSizeChange}
                    className="font-size-slider"
                  />
                  <span className="font-size-large">A</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cuenta' && (
            <div className="settings-section">
              <h2>Cuenta</h2>
              <p>Configuración de tu cuenta y perfil</p>
              {/* Aquí el contenido para la configuración de cuenta */}
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div className="settings-section">
              <h2>Notificaciones</h2>
              <p>Configura cómo y cuándo recibir notificaciones</p>
              {/* Aquí el contenido para la configuración de notificaciones */}
            </div>
          )}

          {activeTab === 'privacidad' && (
            <div className="settings-section">
              <h2>Privacidad</h2>
              <p>Controla quién puede ver tu perfil y contenido</p>
              {/* Aquí el contenido para la configuración de privacidad */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;