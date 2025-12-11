import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Card = ({
  title,
  subtitle,
  children,
  footer,
  onPress,
  style = {},
  contentStyle = {}
}) => {
  const { theme } = useTheme();

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.sizes.cardBorderRadius
        },
        style
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {(title || subtitle) && (
        <View style={styles.headerContainer}>
          {title && (
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      
      <View style={[styles.contentContainer, contentStyle]}>
        {children}
      </View>
      
      {footer && (
        <View style={[styles.footerContainer, { borderTopColor: theme.colors.border }]}>
          {footer}
        </View>
      )}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  contentContainer: {
    padding: 16,
  },
  footerContainer: {
    padding: 16,
    borderTopWidth: 1,
  }
});

export default Card;
