import apiService from './api';

/**
 * Servicio para el módulo académico
 */
const academicService = {
  /**
   * Obtener todas las materias
   */
  getMaterias: async () => {
    try {
      const response = await apiService.get('/materias');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo materias:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener una materia por ID
   */
  getMateria: async (idMateria) => {
    try {
      const response = await apiService.get(`/materias/${idMateria}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo materia:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener grupos de una materia
   */
  getGrupos: async () => {
    try {
      const response = await apiService.get('/grupos');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo grupos:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener notas de un estudiante
   */
  getNotasEstudiante: async (ci) => {
    try {
      const response = await apiService.get(`/notas/estudiante/${ci}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo notas:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener horario de un grupo
   */
  getHorarioGrupo: async (idGrupo) => {
    try {
      const response = await apiService.get(`/horarios/grupo/${idGrupo}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo horario:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener horarios de un estudiante
   */
  getHorariosEstudiante: async (ci) => {
    try {
      const response = await apiService.get(`/horarios/estudiante/${ci}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener docentes
   */
  getDocentes: async () => {
    try {
      const response = await apiService.get('/docentes');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo docentes:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener docente por CI
   */
  getDocente: async (ci) => {
    try {
      const response = await apiService.get(`/docentes/${ci}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo docente:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener estudiantes
   */
  getEstudiantes: async () => {
    try {
      const response = await apiService.get('/estudiantes');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo estudiantes:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener estudiante por CI
   */
  getEstudiante: async (ci) => {
    try {
      const response = await apiService.get(`/estudiantes/${ci}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo estudiante:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  // ============= FUNCIONES DE ADMINISTRACIÓN =============

  /**
   * Crear una nueva materia (admin)
   */
  createMateria: async (materiaData) => {
    try {
      const response = await apiService.post('/materias', materiaData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error creando materia:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Actualizar una materia (admin)
   */
  updateMateria: async (idMateria, materiaData) => {
    try {
      const response = await apiService.put(`/materias/${idMateria}`, materiaData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error actualizando materia:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Eliminar una materia (admin)
   */
  deleteMateria: async (idMateria) => {
    try {
      const response = await apiService.delete(`/materias/${idMateria}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error eliminando materia:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener todos los horarios (admin)
   */
  getHorarios: async () => {
    try {
      const response = await apiService.get('/horarios');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Crear un nuevo horario (admin)
   */
  createHorario: async (horarioData) => {
    try {
      const response = await apiService.post('/horarios', horarioData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error creando horario:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Eliminar un horario (admin)
   */
  deleteHorario: async (idHorario) => {
    try {
      const response = await apiService.delete(`/horarios/${idHorario}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error eliminando horario:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Asignar materia a estudiante (admin)
   */
  asignarMateriaEstudiante: async (asignacionData) => {
    try {
      const response = await apiService.post('/estudiantes/materias', asignacionData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error asignando materia:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  /**
   * Obtener materias de un estudiante específico
   */
  getMateriasEstudiante: async (ciEstudiante) => {
    try {
      const response = await apiService.get(`/estudiantes/${ciEstudiante}/materias`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error obteniendo materias del estudiante:', error);
      return { 
        data: null, 
        error: error.response?.data?.detail || error.message 
      };
    }
  },

  // Alias para compatibilidad
  getEstudianteByCi: async (ci) => {
    return academicService.getEstudiante(ci);
  },

  getHorariosByGrupo: async (idGrupo) => {
    return academicService.getHorarioGrupo(idGrupo);
  },

  // ============= FUNCIONES DE GESTIÓN DE NOTAS =============

  /**
   * Crear una nueva nota (admin/docente)
   */
  createNota: async (notaData) => {
    try {
      const response = await apiService.post('/notas', notaData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error creando nota:', error);
      return {
        data: null,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  /**
   * Actualizar una nota (admin/docente)
   */
  updateNota: async (idNota, notaData) => {
    try {
      const response = await apiService.put(`/notas/${idNota}`, notaData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error actualizando nota:', error);
      return {
        data: null,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  /**
   * Eliminar una nota (admin/docente)
   */
  deleteNota: async (idNota) => {
    try {
      const response = await apiService.delete(`/notas/${idNota}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error eliminando nota:', error);
      return {
        data: null,
        error: error.response?.data?.detail || error.message
      };
    }
  }
};

export default academicService;
