import React, { createContext, useState, useContext } from 'react';

// Contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para acceder al contexto
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  // Estado para almacenar información del usuario
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para iniciar sesión (simulada)
  const login = (userData) => {
    try {
      console.log('Iniciando sesión con:', userData);
      // Simulamos un usuario autenticado
      setUser(userData || { 
        id: 'user-123', 
        nombre: 'Usuario de Prueba',
        email: 'usuario@ejemplo.com',
        rol: 'estudiante'
      });
      
      // Guardamos en localStorage para persistencia entre recargas
      localStorage.setItem('user-data', JSON.stringify(userData || { 
        id: 'user-123', 
        nombre: 'Usuario de Prueba',
        email: 'usuario@ejemplo.com',
        rol: 'estudiante'
      }));
      
      return { user: userData };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error al iniciar sesión');
      return { error: 'Error al iniciar sesión' };
    }
  };

  // Función para registrar usuario (simulada)
  const signUp = (userData) => {
    try {
      console.log('Registrando usuario:', userData);
      // Simulamos registro exitoso
      const newUser = { 
        ...userData, 
        id: 'user-' + Math.random().toString(36).substr(2, 9) 
      };
      setUser(newUser);
      localStorage.setItem('user-data', JSON.stringify(newUser));
      return { user: newUser };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setError('Error al registrar usuario');
      return { error: 'Error al registrar usuario' };
    }
  };

  // Función para cerrar sesión
  const signOut = () => {
    console.log('Cerrando sesión');
    setUser(null);
    localStorage.removeItem('user-data');
  };

  // Función para restablecer contraseña (simulada)
  const resetPassword = (email) => {
    console.log('Restableciendo contraseña para:', email);
    return { data: { message: 'Correo de restablecimiento enviado' } };
  };

  // Alias para compatibilidad con código existente
  const logout = signOut;
  const signIn = login;

  // Verificar si hay usuario guardado en localStorage al iniciar
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user-data');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error al recuperar datos del usuario:', error);
      }
    }
  }, []);

  // Valor que se proporciona al contexto
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
    isLoading: loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
