import apiService from './api';

/**
 * Servicio para el módulo de mensajería
 */
const mensajeriaService = {
  /**
   * Obtener todas las conversaciones del usuario
   */
  getConversaciones: async () => {
    try {
      const response = await apiService.get('/mensajes/conversaciones');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Crear una nueva conversación
   */
  crearConversacion: async (conversacionData) => {
    try {
      const response = await apiService.post('/mensajes/conversaciones', conversacionData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error creando conversación:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener mensajes de una conversación
   */
  getMensajesConversacion: async (idConversacion) => {
    try {
      const response = await apiService.get(`/mensajes/conversacion/${idConversacion}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener información detallada de una conversación (participantes, etc.)
   */
  getConversacionInfo: async (idConversacion) => {
    try {
      const response = await apiService.get(`/mensajes/conversacion/${idConversacion}/info`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo info de conversación:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Enviar un mensaje
   */
  enviarMensaje: async (mensajeData) => {
    try {
      const response = await apiService.post('/mensajes', mensajeData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Marcar mensaje como leído
   */
  marcarComoLeido: async (idMensaje) => {
    try {
      const response = await apiService.put(`/mensajes/${idMensaje}/leer`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error marcando mensaje como leído:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Buscar usuarios para iniciar conversación
   */
  buscarUsuarios: async (query) => {
    try {
      const response = await apiService.get(`/usuarios/search/query?q=${encodeURIComponent(query)}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  }
};

export default mensajeriaService;
