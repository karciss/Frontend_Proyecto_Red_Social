import axios from 'axios';

// Crear una instancia de axios con la URL base del backend
// Si no se define `REACT_APP_API_URL` en el entorno, usar el backend desplegado en Render
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://backend-social-f3ob.onrender.com/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores comunes en las respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (no autorizado) y no hemos intentado actualizar el token antes
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Limpiar tokens y redirigir al login
      localStorage.removeItem('user-token');
      localStorage.removeItem('user-data');
      localStorage.removeItem('refresh-token');
      
      // Solo redirigir si no estamos ya en login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Exportar funciones específicas para cada módulo del backend
export const apiService = {
  // Endpoints de autenticación
  auth: {
    login: (username, password) => {
      // El backend espera form-data para OAuth2
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      return api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
    },
    register: (userData) => api.post('/auth/register', userData),
    refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
    getMe: () => api.get('/auth/me'),
  },
  
  // Endpoints de usuarios
  usuarios: {
    getAll: (skip = 0, limit = 50) => api.get(`/usuarios?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/usuarios/${id}`),
    update: (id, data) => api.put(`/usuarios/${id}`, data),
    delete: (id) => api.delete(`/usuarios/${id}`),
  },
  
  // Endpoints de estudiantes
  estudiantes: {
    getAll: (skip = 0, limit = 50) => api.get(`/estudiantes?skip=${skip}&limit=${limit}`),
    getByCi: (ci) => api.get(`/estudiantes/${ci}`),
    create: (data) => api.post('/estudiantes', data),
    update: (ci, data) => api.put(`/estudiantes/${ci}`, data),
    delete: (ci) => api.delete(`/estudiantes/${ci}`),
  },
  
  // Endpoints de docentes
  docentes: {
    getAll: (skip = 0, limit = 50) => api.get(`/docentes?skip=${skip}&limit=${limit}`),
    getByCi: (ci) => api.get(`/docentes/${ci}`),
    create: (data) => api.post('/docentes', data),
    update: (ci, data) => api.put(`/docentes/${ci}`, data),
    delete: (ci) => api.delete(`/docentes/${ci}`),
  },
  
  // Endpoints de publicaciones (Red Social)
  publicaciones: {
    getAll: (skip = 0, limit = 50) => api.get(`/publicaciones?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/publicaciones/${id}`),
    create: (data) => api.post('/publicaciones', data),
    update: (id, data) => api.put(`/publicaciones/${id}`, data),
    delete: (id) => api.delete(`/publicaciones/${id}`),
  },
  
  // Endpoints de comentarios
  comentarios: {
    getByPublicacion: (idPublicacion) => api.get(`/comentarios/publicacion/${idPublicacion}`),
    create: (data) => api.post('/comentarios', data),
    update: (id, data) => api.put(`/comentarios/${id}`, data),
    delete: (id) => api.delete(`/comentarios/${id}`),
  },
  
  // Endpoints de reacciones
  reacciones: {
    getByPublicacion: (idPublicacion) => api.get(`/reacciones/publicacion/${idPublicacion}`),
    create: (data) => api.post('/reacciones', data),
    delete: (id) => api.delete(`/reacciones/${id}`),
  },
  
  // Endpoints de mensajería
  mensajes: {
    getConversaciones: () => api.get('/mensajes/conversaciones'),
    createConversacion: (data) => api.post('/mensajes/conversacion', data),
    getMensajes: (idConversacion) => api.get(`/mensajes/conversacion/${idConversacion}`),
    sendMensaje: (data) => api.post('/mensajes', data),
    marcarLeido: (idMensaje) => api.put(`/mensajes/${idMensaje}/leer`),
  },
  
  // Endpoints de notificaciones
  notificaciones: {
    getAll: (skip = 0, limit = 50) => api.get(`/notificaciones?skip=${skip}&limit=${limit}`),
    getNoLeidas: () => api.get('/notificaciones/no-leidas'),
    marcarLeida: (id) => api.put(`/notificaciones/${id}/leer`),
    marcarTodasLeidas: () => api.put('/notificaciones/marcar-todas-leidas'),
    delete: (id) => api.delete(`/notificaciones/${id}`),
  },
  
  // Endpoints de carpooling
  rutas: {
    getAll: (skip = 0, limit = 50) => api.get(`/rutas-carpooling?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/rutas-carpooling/${id}`),
    create: (data) => api.post('/rutas-carpooling', data),
    update: (id, data) => api.put(`/rutas-carpooling/${id}`, data),
    delete: (id) => api.delete(`/rutas-carpooling/${id}`),
    addParada: (id, data) => api.post(`/rutas-carpooling/${id}/paradas`, data),
  },
  
  // Endpoints de pasajeros (carpooling)
  pasajeros: {
    solicitar: (data) => api.post('/pasajeros', data),
    aceptar: (idPasajero) => api.put(`/pasajeros/${idPasajero}`, { estado: 'aceptado' }),
    rechazar: (idPasajero) => api.put(`/pasajeros/${idPasajero}`, { estado: 'rechazado' }),
    cancelar: (idPasajero) => api.delete(`/pasajeros/${idPasajero}`),
  },
  
  // Endpoints académicos
  materias: {
    getAll: (skip = 0, limit = 50) => api.get(`/materias?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/materias/${id}`),
    create: (data) => api.post('/materias', data),
    update: (id, data) => api.put(`/materias/${id}`, data),
    delete: (id) => api.delete(`/materias/${id}`),
  },
  
  notas: {
    getByEstudiante: (ciEst) => api.get(`/notas/estudiante/${ciEst}`),
    create: (data) => api.post('/notas', data),
    update: (id, data) => api.put(`/notas/${id}`, data),
    delete: (id) => api.delete(`/notas/${id}`),
  },
  
  horarios: {
    getByGrupo: (idGrupo) => api.get(`/horarios/grupo/${idGrupo}`),
    create: (data) => api.post('/horarios', data),
    update: (id, data) => api.put(`/horarios/${id}`, data),
    delete: (id) => api.delete(`/horarios/${id}`),
  },
  
  grupos: {
    getAll: (skip = 0, limit = 50) => api.get(`/grupos?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/grupos/${id}`),
    create: (data) => api.post('/grupos', data),
    update: (id, data) => api.put(`/grupos/${id}`, data),
  },
};

export default api;
