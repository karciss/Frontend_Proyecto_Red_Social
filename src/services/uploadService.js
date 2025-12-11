/**
 * Servicio para manejar la carga de archivos
 * Sube archivos al backend que los almacena en Supabase Storage
 */

import apiService from './api';

/**
 * Sube archivos al servidor
 * @param {File[]} files - Archivos a subir
 * @returns {Promise<{data: string[], error: string|null}>}
 */
export const uploadFiles = async (files) => {
  try {
    // Crear FormData para enviar archivos
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Subir al backend
    const response = await apiService.post('/upload/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Extraer las URLs de la respuesta
    const urls = response.data.files.map(file => file.url);
    
    return { data: urls, error: null };
  } catch (error) {
    console.error('Error al subir archivos:', error);
    const errorMessage = error.response?.data?.detail || error.message || 'Error al subir archivos';
    return { data: null, error: errorMessage };
  }
};

/**
 * Determina el tipo de media basado en el tipo MIME del archivo
 * @param {File|string} fileOrType - Archivo o tipo MIME
 * @returns {string} - 'imagen', 'video', 'documento', 'audio'
 */
export const getMediaType = (fileOrType) => {
  const mimeType = typeof fileOrType === 'string' ? fileOrType : fileOrType?.type;
  
  if (!mimeType) {
    return 'documento';
  }
  
  if (mimeType.startsWith('image/')) {
    return 'imagen';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else if (mimeType.startsWith('audio/')) {
    return 'audio';
  } else {
    return 'documento';
  }
};

/**
 * Valida que los archivos cumplan con restricciones
 * @param {File[]} files 
 * @param {Object} options - Opciones de validación
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateFiles = (files, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB por defecto
    maxFiles = 5,
    allowedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  } = options;

  if (files.length > maxFiles) {
    return { valid: false, error: `Solo puedes subir hasta ${maxFiles} archivos` };
  }

  for (const file of files) {
    if (file.size > maxSize) {
      return { valid: false, error: `El archivo ${file.name} excede el tamaño máximo de ${maxSize / (1024 * 1024)}MB` };
    }

    // Validar tipo de archivo
    const fileType = file.type;
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return fileType.startsWith(category + '/');
      }
      return fileType === type;
    });

    if (!isAllowed) {
      return { valid: false, error: `El tipo de archivo ${file.name} no está permitido` };
    }
  }

  return { valid: true, error: null };
};

export default {
  uploadFiles,
  getMediaType,
  validateFiles
};
