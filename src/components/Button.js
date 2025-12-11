import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  icon = null,
  style = {},
  textStyle = {}
}) => {
  const { theme } = useTheme();

  // Definir variantes del botón
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.colors.secondary : theme.colors.primary,
          borderColor: theme.colors.primary
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.primary,
          borderWidth: 1
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.border,
          borderWidth: 1
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error,
          borderColor: theme.colors.error
        };
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          borderColor: theme.colors.success
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          paddingHorizontal: 0
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary
        };
    }
  };

  // Definir estilos para el texto según la variante
  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          color: theme.colors.background,
          fontWeight: '600'
        };
      case 'secondary':
      case 'outline':
        return {
          color: theme.colors.primary,
          fontWeight: '600'
        };
      case 'danger':
        return {
          color: theme.colors.background,
          fontWeight: '600'
        };
      case 'success':
        return {
          color: theme.colors.background,
          fontWeight: '600'
        };
      case 'text':
        return {
          color: theme.colors.primary,
          fontWeight: '600'
        };
      default:
        return {
          color: theme.colors.background,
          fontWeight: '600'
        };
    }
  };

  const buttonStyles = [
    styles.button,
    getVariantStyle(),
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style
  ];

  const textStyles = [
    styles.text,
    getTextStyle(),
    disabled && { color: theme.colors.secondary },
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;
