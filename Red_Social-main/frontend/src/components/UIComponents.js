import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const Card = ({ children, style }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.md,
      boxShadow: theme.shadows.small,
      ...style
    }}>
      {children}
    </div>
  );
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false, 
  onClick,
  style 
}) => {
  const { theme } = useTheme();
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return 'transparent';
      case 'success': return theme.colors.success;
      case 'danger': return theme.colors.notification;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'secondary') return theme.colors.primary;
    return '#FFFFFF';
  };
  
  const getPadding = () => {
    switch (size) {
      case 'small': return `${theme.spacing.xs} ${theme.spacing.sm}`;
      case 'medium': return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'large': return `${theme.spacing.md} ${theme.spacing.lg}`;
      default: return `${theme.spacing.sm} ${theme.spacing.md}`;
    }
  };

  const getBorder = () => {
    if (variant === 'secondary') return `1px solid ${theme.colors.primary}`;
    return 'none';
  };
  
  return (
    <button 
      onClick={onClick}
      style={{
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        border: getBorder(),
        padding: getPadding(),
        borderRadius: theme.borderRadius.small,
        cursor: 'pointer',
        width: fullWidth ? '100%' : 'auto',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {children}
    </button>
  );
};

export const Heading = ({ level = 2, children, align = 'left', style }) => {
  const { theme } = useTheme();
  
  const getFontSize = () => {
    switch (level) {
      case 1: return theme.typography.h1.fontSize;
      case 2: return theme.typography.h2.fontSize;
      case 3: return theme.typography.h3.fontSize;
      case 4: return '1.25rem';
      case 5: return '1.1rem';
      case 6: return '1rem';
      default: return theme.typography.h2.fontSize;
    }
  };
  
  const getFontWeight = () => {
    switch (level) {
      case 1: return theme.typography.h1.fontWeight;
      case 2: return theme.typography.h2.fontWeight;
      case 3: return theme.typography.h3.fontWeight;
      default: return '600';
    }
  };
  
  const CustomTag = `h${level}`;
  
  return (
    <CustomTag
      style={{
        fontSize: getFontSize(),
        fontWeight: getFontWeight(),
        color: theme.colors.text,
        textAlign: align,
        marginBottom: theme.spacing.md,
        ...style
      }}
    >
      {children}
    </CustomTag>
  );
};

export const Avatar = ({ initials, size = 'medium', style }) => {
  const { theme } = useTheme();
  
  const getSize = () => {
    switch (size) {
      case 'small': return '24px';
      case 'medium': return '36px';
      case 'large': return '48px';
      default: return '36px';
    }
  };
  
  return (
    <div style={{
      width: getSize(),
      height: getSize(),
      borderRadius: '50%',
      backgroundColor: theme.colors.primary,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      ...style
    }}>
      {initials}
    </div>
  );
};

export const Badge = ({ children, color = 'primary', style }) => {
  const { theme } = useTheme();
  
  const getBackgroundColor = () => {
    switch (color) {
      case 'primary': return theme.colors.primary;
      case 'success': return theme.colors.success;
      case 'danger': return theme.colors.notification;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  };
  
  return (
    <span style={{
      backgroundColor: getBackgroundColor(),
      color: 'white',
      padding: '3px 8px',
      borderRadius: theme.borderRadius.small,
      fontSize: '0.75rem',
      fontWeight: '500',
      ...style
    }}>
      {children}
    </span>
  );
};

export const Divider = ({ margin = 'md', style }) => {
  const { theme } = useTheme();
  
  const getMargin = () => {
    switch (margin) {
      case 'xs': return theme.spacing.xs;
      case 'sm': return theme.spacing.sm;
      case 'md': return theme.spacing.md;
      case 'lg': return theme.spacing.lg;
      case 'xl': return theme.spacing.xl;
      default: return theme.spacing.md;
    }
  };
  
  return (
    <div
      style={{
        height: '1px',
        width: '100%',
        backgroundColor: theme.colors.border,
        margin: `${getMargin()} 0`,
        ...style
      }}
    />
  );
};