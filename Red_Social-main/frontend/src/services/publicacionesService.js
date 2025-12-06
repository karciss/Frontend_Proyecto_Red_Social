import { apiService } from './api';

/**
 * Servicio para gestionar publicaciones de la red social
 * Se conecta con el backend en Render
 */
export const publicacionesService = {
  /**
   * Obtener el feed de publicaciones
   * @param {number} skip - Número de publicaciones a saltar (paginación)
   * @param {number} limit - Cantidad de publicaciones a obtener
   * @returns {Promise<{data?: Array, error?: string}>}
   */
  getFeed: async (skip = 0, limit = 20) => {
    try {
      const response = await apiService.publicaciones.getAll(skip, limit);
      return { data: response.data || [] };
    } catch (error) {
      console.error('Error al obtener feed:', error);
      const errorMessage = error.response?.data?.detail || 'Error al cargar publicaciones';
      return { error: errorMessage, data: [] };
    }
  },

  /**
   * Obtener una publicación por ID
   * @param {string} id - ID de la publicación
   * @returns {Promise<{data?: object, error?: string}>}
   */
  getById: async (id) => {
    try {
      const response = await apiService.publicaciones.getById(id);
      return { data: response.data };
    } catch (error) {
      console.error('Error al obtener publicación:', error);
      const errorMessage = error.response?.data?.detail || 'Error al cargar publicación';
      return { error: errorMessage };
    }
  },

  /**
   * Crear una nueva publicación
   * @param {object} publicacionData - Datos de la publicación
   * @param {string} publicacionData.contenido - Contenido de la publicación
   * @param {string} publicacionData.tipo - Tipo: 'texto', 'imagen', 'documento', 'enlace'
   * @param {Array<string>} publicacionData.media_urls - URLs de archivos multimedia (opcional)
   * @returns {Promise<{data?: object, error?: string}>}
   */
  create: async (publicacionData) => {
    try {
      // Obtener el id_user del usuario actual
      const userData = localStorage.getItem('user-data');
      let id_user = null;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          id_user = user.id_user || user.id;
        } catch (e) {
          console.error('Error al parsear user-data:', e);
        }
      }
      
      // Asegurarse de que el tipo esté en minúsculas
      const data = {
        contenido: publicacionData.contenido,
        tipo: (publicacionData.tipo || 'texto').toLowerCase(),
        media_urls: publicacionData.media_urls || [],
        id_user: id_user  // Incluir el id del usuario
      };
      
      console.log('Enviando datos de publicación:', data);
      
      const response = await apiService.publicaciones.create(data);
      return { data: response.data };
    } catch (error) {
      console.error('Error completo al crear publicación:', error);
      console.error('Response data:', error.response?.data);
      
      // Intentar extraer el mensaje de error más específico
      let errorMessage = 'Error al crear publicación';
      
      if (error.response?.data?.detail) {
        // Si detail es un array (errores de validación de FastAPI)
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(e => e.msg).join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else {
          errorMessage = JSON.stringify(error.response.data.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { error: errorMessage };
    }
  },

  /**
   * Actualizar una publicación existente
   * @param {string} id - ID de la publicación
   * @param {object} updateData - Datos a actualizar (contenido)
   * @returns {Promise<{data?: object, error?: string}>}
   */
  update: async (id, updateData) => {
    try {
      const response = await apiService.publicaciones.update(id, updateData);
      return { data: response.data };
    } catch (error) {
      console.error('Error al actualizar publicación:', error);
      const errorMessage = error.response?.data?.detail || 'Error al actualizar publicación';
      return { error: errorMessage };
    }
  },

  /**
   * Eliminar una publicación
   * @param {string} id - ID de la publicación
   * @returns {Promise<{success?: boolean, error?: string}>}
   */
  delete: async (id) => {
    try {
      await apiService.publicaciones.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      const errorMessage = error.response?.data?.detail || 'Error al eliminar publicación';
      return { error: errorMessage };
    }
  },

  /**
   * Obtener comentarios de una publicación
   * @param {string} idPublicacion - ID de la publicación
   * @returns {Promise<{data?: Array, error?: string}>}
   */
  getComentarios: async (idPublicacion) => {
    try {
      const response = await apiService.comentarios.getByPublicacion(idPublicacion);
      return { data: response.data || [] };
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      const errorMessage = error.response?.data?.detail || 'Error al cargar comentarios';
      return { error: errorMessage, data: [] };
    }
  },

  /**
   * Crear un comentario en una publicación
   * @param {string} idPublicacion - ID de la publicación
   * @param {string} contenido - Contenido del comentario
   * @returns {Promise<{data?: object, error?: string}>}
   */
  comentar: async (idPublicacion, contenido) => {
    try {
      // Obtener el id_user del usuario actual
      const userData = localStorage.getItem('user-data');
      let id_user = null;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          id_user = user.id_user || user.id;
        } catch (e) {
          console.error('Error al parsear user-data:', e);
        }
      }
      
      const response = await apiService.comentarios.create({
        id_publicacion: idPublicacion,
        contenido: contenido,
        id_user: id_user
      });
      return { data: response.data };
    } catch (error) {
      console.error('Error al crear comentario:', error);
      console.error('Response data:', error.response?.data);
      
      // Intentar extraer el mensaje de error más específico
      let errorMessage = 'Error al comentar';
      
      if (error.response?.data?.detail) {
        // Si detail es un array (errores de validación de FastAPI)
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(e => e.msg).join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else {
          errorMessage = JSON.stringify(error.response.data.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { error: errorMessage };
    }
  },

  /**
   * Eliminar un comentario
   * @param {string} idComentario - ID del comentario
   * @returns {Promise<{success?: boolean, error?: string}>}
   */
  deleteComentario: async (idComentario) => {
    try {
      await apiService.comentarios.delete(idComentario);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      const errorMessage = error.response?.data?.detail || 'Error al eliminar comentario';
      return { error: errorMessage };
    }
  },

  /**
   * Obtener reacciones de una publicación
   * @param {string} idPublicacion - ID de la publicación
   * @returns {Promise<{data?: Array, error?: string}>}
   */
  getReacciones: async (idPublicacion) => {
    try {
      const response = await apiService.reacciones.getByPublicacion(idPublicacion);
      return { data: response.data || [] };
    } catch (error) {
      console.error('Error al obtener reacciones:', error);
      const errorMessage = error.response?.data?.detail || 'Error al cargar reacciones';
      return { error: errorMessage, data: [] };
    }
  },

  /**
   * Reaccionar a una publicación
   * @param {string} idPublicacion - ID de la publicación
   * @param {string} tipo - Tipo de reacción: 'like', 'dislike', 'love', 'wow', 'sad', 'angry'
   * @returns {Promise<{data?: object, error?: string}>}
   */
  reaccionar: async (idPublicacion, tipo = 'like') => {
    try {
      const response = await apiService.reacciones.create({
        id_publicacion: idPublicacion,
        tipo_reac: tipo.toLowerCase()
      });
      return { data: response.data };
    } catch (error) {
      console.error('Error al reaccionar:', error);
      let errorMessage = 'Error al reaccionar';
      
      // Manejar diferentes formatos de error
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          // FastAPI validation errors: [{ loc, msg, type }]
          errorMessage = detail.map(err => err.msg || JSON.stringify(err)).join(', ');
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || JSON.stringify(detail);
        }
      }
      
      return { error: errorMessage };
    }
  },

  /**
   * Eliminar una reacción
   * @param {string} idReaccion - ID de la reacción
   * @returns {Promise<{success?: boolean, error?: string}>}
   */
  deleteReaccion: async (idReaccion) => {
    try {
      await apiService.reacciones.delete(idReaccion);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar reacción:', error);
      const errorMessage = error.response?.data?.detail || 'Error al eliminar reacción';
      return { error: errorMessage };
    }
  }
};

export default publicacionesService;
