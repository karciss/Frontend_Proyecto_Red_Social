import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Componente de configuración de tema
 * Solo modo oscuro disponible
 */
const ThemeSettings = () => {
  const { theme } = useTheme();

  return (
    <div className="theme-settings-container">
      <div className="theme-settings-header">
        <h2 className="theme-settings-title">Configuración</h2>
      </div>
      
      <div className="theme-settings-content">
        <h3 className="theme-section-title">Apariencia</h3>
        
        <div className="theme-section">
          <label className="theme-label">Tema</label>
          
          <div className="theme-options-container">
            {/* Opción de tema oscuro - único disponible */}
            <div className={`theme-option active`}>
              <div className="theme-preview dark-preview">
                <div className="theme-preview-header"></div>
                <div className="theme-preview-content">
                  <div className="theme-preview-line"></div>
                  <div className="theme-preview-line short"></div>
                </div>
              </div>
              <div className="theme-option-label">
                <span className="theme-option-icon">🌙</span>
                <span>Tema Oscuro</span>
                <span className="theme-check">✓</span>
              </div>
            </div>
            
            {/* Opción de tema colorido (próximamente) */}
            <div className="theme-option disabled">
              <div className="theme-preview colorful-preview">
                <div className="theme-preview-header"></div>
                <div className="theme-preview-content">
                  <div className="theme-preview-line"></div>
                  <div className="theme-preview-line short"></div>
                </div>
              </div>
              <div className="theme-option-label">
                <span className="theme-option-icon">🎨</span>
                <span>Colorido (Próximamente)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;