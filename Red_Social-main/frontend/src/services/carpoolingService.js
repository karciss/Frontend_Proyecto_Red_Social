import { apiService } from './api';
import api from './api';

const carpoolingService = {
  // Obtener todas las rutas disponibles
  getRutas: (skip = 0, limit = 50) => {
    return apiService.rutas.getAll(skip, limit);
  },

  // Obtener mis rutas (como conductor y pasajero)
  getMisRutas: () => {
    return api.get('/rutas-carpooling/mis-rutas');
  },

  // Crear nueva ruta
  createRuta: (rutaData) => {
    return apiService.rutas.create(rutaData);
  },

  // Postularse como pasajero
  postularPasajero: (data) => {
    return apiService.pasajeros.solicitar(data);
  },

  // Obtener ruta por ID
  getRutaById: (id) => {
    return apiService.rutas.getById(id);
  },

  // Aceptar pasajero
  aceptarPasajero: (idPasajero) => {
    return apiService.pasajeros.aceptar(idPasajero);
  },

  // Rechazar pasajero
  rechazarPasajero: (idPasajero) => {
    return apiService.pasajeros.rechazar(idPasajero);
  },

  // Cancelar solicitud como pasajero
  cancelarSolicitud: (idPasajero) => {
    return apiService.pasajeros.cancelar(idPasajero);
  },

  // Eliminar ruta
  deleteRuta: (idRuta) => {
    return api.delete(`/rutas-carpooling/${idRuta}`);
  },

  // Actualizar ruta
  updateRuta: (idRuta, rutaData) => {
    return api.put(`/rutas-carpooling/${idRuta}`, rutaData);
  }
};

export default carpoolingService;