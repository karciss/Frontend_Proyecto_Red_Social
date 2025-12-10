import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

/**
 * Contexto de autenticación conectado con el backend real
 * Backend: https://backend-social-f3ob.onrender.com
 */
const AuthContext = createContext();

// Hook personalizado para acceder al contexto
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = authService.getCurrentSession();
        
        if (session.data) {
          setUser(session.data.user);
          
          // Opcional: Validar token con el backend
          // const { data, error } = await authService.getCurrentUser();
          // if (data) {
          //   setUser(data);
          // } else if (error) {
          //   console.error('Token inválido:', error);
          //   await authService.signOut();
          //   setUser(null);
          // }
        }
      } catch (e) {
        console.error('Error al inicializar autenticación:', e);
        await authService.signOut();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Iniciar sesión con correo y contraseña
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise<{user?: object, error?: string}>}
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: authError } = await authService.signIn(email, password);
      
      if (authError) {
        setError(authError);
        return { error: authError };
      }
      
      if (data && data.user) {
        setUser(data.user);
        return { user: data.user };
      }
      
      const genericError = 'Error al iniciar sesión';
      setError(genericError);
      return { error: genericError };
    } catch (error) {
      const errorMessage = 'Error inesperado al iniciar sesión';
      console.error('Error en login:', error);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registrar un nuevo usuario
   * @param {object} userData - Datos del usuario (nombre, apellido, correo, contrasena, rol)
   * @returns {Promise<{user?: object, error?: string}>}
   */
  const signUp = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Asegurarse de que los datos tengan el formato correcto
      const registerData = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: userData.correo,
        contrasena: userData.contrasena || userData.password,
        rol: userData.rol || 'estudiante'
      };
      
      const { data, error: authError } = await authService.signUp(registerData);
      
      if (authError) {
        setError(authError);
        return { error: authError };
      }
      
      if (data && data.user) {
        setUser(data.user);
        return { user: data.user };
      }
      
      const genericError = 'Error al registrar usuario';
      setError(genericError);
      return { error: genericError };
    } catch (error) {
      const errorMessage = 'Error inesperado al registrar';
      console.error('Error en signUp:', error);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refrescar el token de acceso
   * @returns {Promise<boolean>} - true si se refrescó exitosamente
   */
  const refreshToken = async () => {
    try {
      const { data, error } = await authService.refreshToken();
      
      if (error) {
        console.error('Error al refrescar token:', error);
        await signOut();
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error inesperado al refrescar token:', error);
      await signOut();
      return false;
    }
  };

  /**
   * Obtener información actualizada del usuario
   * @returns {Promise<void>}
   */
  const refreshUser = async () => {
    try {
      const { data, error } = await authService.getCurrentUser();
      
      if (data) {
        setUser(data);
      } else if (error) {
        console.error('Error al actualizar usuario:', error);
      }
    } catch (error) {
      console.error('Error inesperado al actualizar usuario:', error);
    }
  };

  // Aliases para compatibilidad con código existente
  const logout = signOut;
  const signIn = login;
  
  // Función para actualizar el usuario localmente
  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    // Guardar en las dos claves para compatibilidad
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('user-data', JSON.stringify(updatedUser));
  };

  // Valor que se proporciona al contexto
  const value = {
    // Estado
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isLoading: loading,
    
    // Métodos principales
    login,
    signIn,
    signUp,
    signOut,
    logout,
    
    // Métodos auxiliares
    refreshToken,
    refreshUser,
    updateUser,
    
    // Limpiar error
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

