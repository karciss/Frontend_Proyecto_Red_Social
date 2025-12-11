import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Componente de control de tema que permite aplicar el tema seleccionado a toda la aplicación
 * y sincronizar los cambios entre distintos componentes
 */
const ThemeController = () => {
  const { theme, isDarkMode } = useTheme();

  // Efecto para aplicar variables CSS personalizadas basadas en el tema actual
  useEffect(() => {
    // Colores base
    document.documentElement.style.setProperty('--primary-color', theme.colors.primary);
    document.documentElement.style.setProperty('--primary-light', 
      isDarkMode ? 'rgba(173, 63, 98, 0.2)' : 'rgba(173, 63, 98, 0.1)');
    
    // Colores de texto - usar directamente los valores del tema
    document.documentElement.style.setProperty('--text-primary', theme.colors.text);
    document.documentElement.style.setProperty('--text-secondary', theme.colors.textLight);
    
    // Colores de fondo - usar directamente los valores del tema
    document.documentElement.style.setProperty('--bg-primary', theme.colors.background);
    document.documentElement.style.setProperty('--bg-secondary', theme.colors.card);
    document.documentElement.style.setProperty('--card-bg', theme.colors.card);
    document.documentElement.style.setProperty('--card-secondary', theme.colors.cardSecondary);

    // Otros colores - usar directamente los valores del tema
    document.documentElement.style.setProperty('--border-color', theme.colors.border);
    document.documentElement.style.setProperty('--input-bg', 
      isDarkMode ? 'rgba(255, 255, 255, 0.07)' : '#F8F8F8');
    document.documentElement.style.setProperty('--hover-bg', 
      isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)');
    
    // Colores adicionales para toda la aplicación
    document.documentElement.style.setProperty('--shadow-color', 
      isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)');
    document.documentElement.style.setProperty('--error-color', '#ff6b6b');
    document.documentElement.style.setProperty('--switch-handle', 'white');
    document.documentElement.style.setProperty('--inactive-toggle', 
      isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)');
    document.documentElement.style.setProperty('--primary-transparent', 
      isDarkMode ? 'rgba(173, 63, 98, 0.2)' : 'rgba(139, 30, 65, 0.2)');

    // Aplicar clase global al body
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
    // También aplicamos los estilos al elemento HTML para asegurar que se aplique a toda la aplicación
    document.documentElement.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode, theme]);
  
  // Este componente no renderiza nada visible
  return null;
};

export default ThemeController;