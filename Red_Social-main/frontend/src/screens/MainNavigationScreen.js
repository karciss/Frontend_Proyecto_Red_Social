import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';
import Card from '../components/Card';

const MainNavigationScreen = () => {
  const { theme } = useTheme();
  
  // Aplicar tema a la etiqueta <body> para el modo web
  useEffect(() => {
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.margin = 0;
    document.body.style.padding = 0;
    document.body.style.fontFamily = 'Roboto, sans-serif';
  }, [theme]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <h1 style={{ color: theme.colors.text, marginBottom: 10 }}>
          Red Social Universitaria
        </h1>
        <p style={{ color: theme.colors.secondary, marginBottom: 40 }}>
          Explora todas las funcionalidades de nuestra plataforma
        </p>
      </View>

      <View style={styles.moduleSection}>
        <h2 style={{ color: theme.colors.text, marginBottom: 20 }}>
          Módulo Académico
        </h2>
        <View style={styles.cardsContainer}>
          <Card style={styles.moduleCard}>
            <h3 style={{ color: theme.colors.text, margin: 0, marginBottom: 10 }}>
              Horario de Clases
            </h3>
            <p style={{ color: theme.colors.secondary, marginBottom: 20 }}>
              Visualiza tu horario académico semanal y consulta tus clases
            </p>
            <Button
              title="Ver Horario"
              onPress={() => window.location.href = '/academic/schedule'}
              variant="primary"
            />
          </Card>

          <Card style={styles.moduleCard}>
            <h3 style={{ color: theme.colors.text, margin: 0, marginBottom: 10 }}>
              Calificaciones
            </h3>
            <p style={{ color: theme.colors.secondary, marginBottom: 20 }}>
              Consulta tus calificaciones por semestre y asignatura
            </p>
            <Button
              title="Ver Calificaciones"
              onPress={() => window.location.href = '/academic/grades'}
              variant="primary"
            />
          </Card>
        </View>
      </View>

      <View style={styles.moduleSection}>
        <h2 style={{ color: theme.colors.text, marginBottom: 20 }}>
          Módulo Social
        </h2>
        <View style={styles.cardsContainer}>
          <Card style={styles.moduleCard}>
            <h3 style={{ color: theme.colors.text, margin: 0, marginBottom: 10 }}>
              Feed Social
            </h3>
            <p style={{ color: theme.colors.secondary, marginBottom: 20 }}>
              Conecta con otros estudiantes y comparte contenido académico y social
            </p>
            <Button
              title="Ver Feed Social"
              onPress={() => window.location.href = '/social/feed'}
              variant="primary"
            />
          </Card>

          <Card style={styles.moduleCard}>
            <h3 style={{ color: theme.colors.text, margin: 0, marginBottom: 10 }}>
              Mensajes
            </h3>
            <p style={{ color: theme.colors.secondary, marginBottom: 20 }}>
              Chatea con otros estudiantes y profesores de forma privada
            </p>
            <Button
              title="Ver Mensajes"
              onPress={() => window.location.href = '/social/messages'}
              variant="primary"
            />
          </Card>
        </View>
      </View>

      <View style={styles.moduleSection}>
        <h2 style={{ color: theme.colors.text, marginBottom: 20 }}>
          Módulo de Viajes Compartidos
        </h2>
        <View style={styles.cardsContainer}>
          <Card style={styles.moduleCard}>
            <h3 style={{ color: theme.colors.text, margin: 0, marginBottom: 10 }}>
              Viajes Compartidos
            </h3>
            <p style={{ color: theme.colors.secondary, marginBottom: 20 }}>
              Comparte viajes con otros estudiantes, ahorra dinero y reduce emisiones
            </p>
            <Button
              title="Ver Viajes"
              onPress={() => window.location.href = '/carpooling/routes'}
              variant="primary"
            />
          </Card>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    maxWidth: 1200,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingTop: 40,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 40,
  },
  moduleSection: {
    marginBottom: 40,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -10,
    marginRight: -10,
  },
  moduleCard: {
    margin: 10,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    minHeight: 200,
  }
});

export default MainNavigationScreen;
