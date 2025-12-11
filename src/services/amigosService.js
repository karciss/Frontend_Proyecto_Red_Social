import api, { apiService } from './api';

const amigosService = {
  // Enviar solicitud de amistad
  enviarSolicitud: async (idUsuarioDestino) => {
    try {
      const response = await api.post('/amigos/solicitud', null, {
        params: { id_usuario_destino: idUsuarioDestino }
      });
      return response.data;
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      throw error;
    }
  },

  // Obtener solicitudes recibidas
  obtenerSolicitudesRecibidas: async () => {
    try {
      const response = await api.get('/amigos/solicitudes-recibidas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener solicitudes recibidas:', error);
      throw error;
    }
  },

  // Obtener solicitudes enviadas
  obtenerSolicitudesEnviadas: async () => {
    try {
      const response = await api.get('/amigos/solicitudes-enviadas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener solicitudes enviadas:', error);
      throw error;
    }
  },

  // Responder solicitud (aceptar o rechazar)
  responderSolicitud: async (idRelacion, accion) => {
    try {
      const response = await api.put(`/amigos/solicitud/${idRelacion}`, null, {
        params: { accion }
      });
      return response.data;
    } catch (error) {
      console.error('Error al responder solicitud:', error);
      throw error;
    }
  },

  // Obtener lista de amigos
  obtenerAmigos: async () => {
    try {
      const response = await api.get('/amigos/lista');
      return response.data;
    } catch (error) {
      console.error('Error al obtener amigos:', error);
      throw error;
    }
  },

  // Eliminar amigo
  eliminarAmigo: async (idRelacion) => {
    try {
      const response = await api.delete(`/amigos/eliminar/${idRelacion}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar amigo:', error);
      throw error;
    }
  },

  // Buscar usuarios
  buscarUsuarios: async (query) => {
    try {
      const response = await api.get('/amigos/buscar', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  }
};

export default amigosService;
