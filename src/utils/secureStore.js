// Este módulo proporciona una capa de abstracción para el almacenamiento seguro
// En entorno web, utilizamos localStorage con encriptación básica para simularlo
// En React Native nativo, usaríamos SecureStore de Expo

const isWeb = typeof window !== 'undefined';

// Función simple de encriptación/desencriptación para localStorage
// NOTA: Esto no es seguridad real, solo para propósitos educativos
// En una aplicación real, usarías una solución más robusta
const encryptValue = (value, secret = 'app-secret-key') => {
  if (!value) return '';
  
  try {
    // Simulación muy básica de encriptación - NO usar en producción
    const encrypted = btoa(
      encodeURIComponent(value)
        .split('')
        .map((c, i) => 
          String.fromCharCode(c.charCodeAt(0) ^ secret.charCodeAt(i % secret.length))
        )
        .join('')
    );
    return encrypted;
  } catch (e) {
    console.error('Error al encriptar:', e);
    return '';
  }
};

const decryptValue = (encrypted, secret = 'app-secret-key') => {
  if (!encrypted) return '';
  
  try {
    // Simulación muy básica de desencriptación - NO usar en producción
    const decrypted = decodeURIComponent(
      atob(encrypted)
        .split('')
        .map((c, i) => 
          String.fromCharCode(c.charCodeAt(0) ^ secret.charCodeAt(i % secret.length))
        )
        .join('')
    );
    return decrypted;
  } catch (e) {
    console.error('Error al desencriptar:', e);
    return '';
  }
};

// API compatible con SecureStore de Expo
export const setItem = async (key, value) => {
  if (isWeb) {
    const encryptedValue = encryptValue(value);
    localStorage.setItem(`secure_${key}`, encryptedValue);
    return;
  }
  
  // Aquí iría la implementación para React Native usando Expo SecureStore
  // Ejemplo: await SecureStore.setItemAsync(key, value);
  console.warn('SecureStore nativo no implementado para esta plataforma');
};

export const getItem = async (key) => {
  if (isWeb) {
    const encryptedValue = localStorage.getItem(`secure_${key}`);
    if (!encryptedValue) return null;
    return decryptValue(encryptedValue);
  }
  
  // Aquí iría la implementación para React Native usando Expo SecureStore
  // Ejemplo: return await SecureStore.getItemAsync(key);
  console.warn('SecureStore nativo no implementado para esta plataforma');
  return null;
};

export const deleteItem = async (key) => {
  if (isWeb) {
    localStorage.removeItem(`secure_${key}`);
    return;
  }
  
  // Aquí iría la implementación para React Native usando Expo SecureStore
  // Ejemplo: await SecureStore.deleteItemAsync(key);
  console.warn('SecureStore nativo no implementado para esta plataforma');
};

export default {
  setItem,
  getItem,
  deleteItem
};
