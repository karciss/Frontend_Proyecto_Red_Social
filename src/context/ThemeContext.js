import React, { createContext, useState, useContext, useEffect } from 'react';
import { lightTheme, darkTheme } from '../theme/theme';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  // Intentamos recuperar la preferencia de tema del localStorage
  const savedTheme = localStorage.getItem('theme');
  const [isDarkMode, setIsDarkMode] = useState(savedTheme === 'light' ? false : true);

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Función para cambiar entre modos de tema
  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      // Guardamos la preferencia en localStorage
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };
  
  // Aplicamos cambios al tema del documento cuando cambia el modo
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkMode);
    document.body.classList.toggle('light-theme', !isDarkMode);
    document.documentElement.classList.toggle('dark-theme', isDarkMode);
    document.documentElement.classList.toggle('light-theme', !isDarkMode);
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    theme,
    toggleTheme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
