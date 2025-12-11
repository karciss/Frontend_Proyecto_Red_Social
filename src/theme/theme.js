import { lightColors, darkColors } from './colors';

// Configuración de temas
export const lightTheme = {
  colors: lightColors,
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    full: '9999px'
  },
  typography: {
    fontFamily: "'Roboto', 'Segoe UI', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: '700'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: '600'
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: '600'
    },
    body1: {
      fontSize: '1rem',
      fontWeight: '400'
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: '400'
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: '400'
    }
  },
  shadows: {
    small: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0px 4px 6px rgba(0, 0, 0, 0.12)',
    large: '0px 8px 16px rgba(0, 0, 0, 0.14)'
  }
};

export const darkTheme = {
  colors: darkColors,
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  typography: lightTheme.typography,
  shadows: {
    small: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    medium: '0px 4px 6px rgba(0, 0, 0, 0.25)',
    large: '0px 8px 16px rgba(0, 0, 0, 0.3)'
  }
};