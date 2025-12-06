// Configuración del servidor WebSocket
const websocketConfig = {
  url: 'ws://localhost:3000/ws',
  reconnectInterval: 3000, // Reconectar cada 3 segundos si se pierde la conexión
  maxReconnectAttempts: 5,
  
  // Método para crear una conexión
  createConnection: () => {
    try {
      const socket = new WebSocket(websocketConfig.url);
      
      socket.onopen = (event) => {
        console.log('Conexión WebSocket establecida');
      };
      
      socket.onclose = (event) => {
        console.log('Conexión WebSocket cerrada');
        // Implementar lógica de reconexión si es necesario
      };
      
      socket.onerror = (error) => {
        console.error('Error en la conexión WebSocket', error);
        // Manejar silenciosamente los errores para evitar errores en consola
      };
      
      return socket;
    } catch (error) {
      console.error('No se pudo establecer la conexión WebSocket', error);
      return null;
    }
  }
};

export default websocketConfig;