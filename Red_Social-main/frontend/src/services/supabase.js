import { createClient } from '@supabase/supabase-js';

// Leer las variables de entorno para la configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Verificar si las variables de entorno están disponibles
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Variables de entorno de Supabase no configuradas correctamente');
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Función para manejar errores de Supabase de forma consistente
export const handleSupabaseError = (error) => {
  console.error('Error de Supabase:', error);
  
  // Personalizar mensajes de error comunes
  const errorMessages = {
    'Email not confirmed': 'El correo electrónico no ha sido confirmado. Por favor, revise su bandeja de entrada.',
    'Invalid login credentials': 'Credenciales de inicio de sesión inválidas.',
    'User already registered': 'El usuario ya está registrado.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    // Añadir más mensajes de error comunes según sea necesario
  };
  
  return {
    message: errorMessages[error.message] || error.message,
    details: error.details,
    code: error.code,
  };
};
