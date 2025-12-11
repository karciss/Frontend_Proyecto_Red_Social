import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error = '',
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style = {},
  inputStyle = {}
}) => {
  const { theme } = useTheme();

  const inputStyles = [
    styles.input,
    { 
      borderColor: error ? theme.colors.error : theme.colors.border,
      color: theme.colors.text,
      height: multiline ? numberOfLines * 40 : theme.sizes.inputHeight,
      backgroundColor: theme.colors.background
    },
    disabled && { backgroundColor: theme.colors.card, opacity: 0.7 },
    inputStyle
  ];

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={inputStyles}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.secondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={!disabled}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
      />
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
  },
});

export default FormInput;
