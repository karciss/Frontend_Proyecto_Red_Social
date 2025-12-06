import { apiService } from './api';

/**
 * Servicio de autenticación que se conecta con el backend en Render
 * Backend: https://backend-social-f3ob.onrender.com
 */
export const authService = {
  /**
   * Iniciar sesión con correo y contraseña
   * @param {string} email - Correo electrónico del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<{data?: object, error?: string}>}
   */
  signIn: async (email, password) => {
    try {
      // El backend usa OAuth2 password flow (username/password)
      const response = await apiService.auth.login(email, password);
      
      if (response.data.access_token) {
        // Guardar tokens
        localStorage.setItem('user-token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh-token', response.data.refresh_token);
        }
        
        // Guardar datos del usuario
        if (response.data.user) {
          localStorage.setItem('user-data', JSON.stringify(response.data.user));
        }
        
        return { data: response.data };
      }
      
      return { error: 'No se recibió token de autenticación' };
    } catch (error) {
      console.error('Error en signIn:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response) {
        // El servidor respondió con un error
        errorMessage = error.response.data?.detail || 
                      error.response.data?.message || 
                      `Error ${error.response.status}: Credenciales incorrectas`;
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        errorMessage = 'No se pudo conectar con el servidor. El backend puede estar iniciando (Render tarda ~1min en activarse).';
      } else {
        // Error al configurar la petición
        errorMessage = error.message || 'Error al procesar la solicitud';
      }
      
      return { error: errorMessage };
    }
  },

  /**
   * Registrar un nuevo usuario
   * @param {object} userData - Datos del usuario (nombre, apellido, correo, contrasena, rol)
   * @returns {Promise<{data?: object, error?: string}>}
   */
  signUp: async (userData) => {
    try {
      const response = await apiService.auth.register(userData);
      
      if (response.data.access_token) {
        // Guardar tokens automáticamente después del registro
        localStorage.setItem('user-token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh-token', response.data.refresh_token);
        }
        
        // Guardar datos del usuario
        if (response.data.user) {
          localStorage.setItem('user-data', JSON.stringify(response.data.user));
        }
        
        return { data: response.data };
      }
      
      return { error: 'No se recibió token de autenticación' };
    } catch (error) {
      console.error('Error en signUp:', error);
      
      let errorMessage = 'Error al registrar usuario';
      
      if (error.response) {
        errorMessage = error.response.data?.detail || 
                      error.response.data?.message || 
                      'Error al registrar. Verifica los datos.';
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor.';
      } else {
        errorMessage = error.message || 'Error al procesar la solicitud';
      }
      
      return { error: errorMessage };
    }
  },

  /**
   * Cerrar sesión
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  signOut: async () => {
    try {
      localStorage.removeItem('user-token');
      localStorage.removeItem('refresh-token');
      localStorage.removeItem('user-data');
      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return { error: 'Error al cerrar sesión' };
    }
  },

  /**
   * Refrescar el token de acceso
   * @returns {Promise<{data?: object, error?: string}>}
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh-token');
      if (!refreshToken) {
        return { error: 'No hay refresh token disponible' };
      }
      
      const response = await apiService.auth.refresh(refreshToken);
      
      if (response.data.access_token) {
        localStorage.setItem('user-token', response.data.access_token);
        return { data: response.data };
      }
      
      return { error: 'No se pudo refrescar el token' };
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return { error: 'Error al refrescar el token' };
    }
  },

  /**
   * Obtener información del usuario actual
   * @returns {Promise<{data?: object, error?: string}>}
   */
  getCurrentUser: async () => {
    try {
      const response = await apiService.auth.getMe();
      
      if (response.data) {
        // Actualizar datos del usuario en localStorage
        localStorage.setItem('user-data', JSON.stringify(response.data));
        return { data: response.data };
      }
      
      return { error: 'No se pudo obtener información del usuario' };
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return { error: 'Error al obtener información del usuario' };
    }
  },

  /**
   * Obtener sesión actual desde localStorage
   * @returns {{data: {token: string, user: object} | null, error?: string}}
   */
  getCurrentSession: () => {
    try {
      const token = localStorage.getItem('user-token');
      const userData = localStorage.getItem('user-data');
      
      if (token && userData) {
        return { 
          data: { 
            token,
            user: JSON.parse(userData)
          }
        };
      }
      
      return { data: null };
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return { error: 'Error al obtener la sesión actual' };
    }
  },

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('user-token');
    return !!token;
  }
};

export default authService;

