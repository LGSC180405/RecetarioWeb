// Configuración de la API para RedRecetas - VERSION MEJORADA
// Este archivo debe ser incluido ANTES de cualquier otro script en tu HTML

// ============================================
// IMPORTANTE: Cambia esta IP por la IP de tu servidor
// Para obtenerla, ejecuta el script obtener-ip.sh
// ============================================
const SERVER_IP = '192.168.1.196'; // <- CAMBIA ESTO POR TU IP REAL

const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

const API_CONFIG = {
  LOCAL: 'http://localhost:3000/api',
  NETWORK: `http://${SERVER_IP}:3000/api`,
  DOCKER: 'http://localhost:8080/api', // Para acceso a través de nginx
  
  get BASE_URL() {
    // Si estamos en localhost, usar conexión directa
    if (isLocalhost) {
      return this.LOCAL;
    }
    // Si estamos accediendo desde otra computadora
    else if (window.location.hostname === SERVER_IP) {
      return this.NETWORK;
    }
    // Si estamos usando el puerto 8080 (nginx)
    else if (window.location.port === '8080') {
      return `http://${window.location.hostname}:8080/api`;
    }
    // Por defecto, intentar con la IP de red
    else {
      return this.NETWORK;
    }
  }
};

// Exportar la configuración para uso global
window.API_URL = API_CONFIG.BASE_URL;
window.API_BASE = API_CONFIG.BASE_URL.replace('/api', '');

// Función helper para hacer peticiones a la API
window.apiRequest = async function(endpoint, options = {}) {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${window.API_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Log de configuración
console.log('🔧 API Config:', {
  'Modo': isLocalhost ? 'LOCAL' : 'RED',
  'API URL': window.API_URL,
  'Hostname': window.location.hostname,
  'Puerto': window.location.port || '80',
  'IP Servidor': SERVER_IP
});

// Verificar conectividad con la API al cargar
async function checkAPIConnection() {
  try {
    const testUrl = API_CONFIG.BASE_URL.replace('/api', '/');
    console.log('🔍 Probando conexión con:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.ok) {
      console.log('✅ Conexión con API establecida');
      return true;
    } else {
      console.error('❌ Error de conexión:', response.status);
      return false;
    }
  } catch (error) {
    console.error('⚠️ No se pudo conectar con la API:', error.message);
    
    // Intentar con diferentes endpoints
    console.log('🔄 Intentando endpoints alternativos...');
    const alternativeEndpoints = [
      `http://${window.location.hostname}:3000/api`,
      `http://${window.location.hostname}:8080/api`,
      `http://${SERVER_IP}:3000/api`,
      `http://${SERVER_IP}:8080/api`
    ];
    
    for (const endpoint of alternativeEndpoints) {
      try {
        console.log(`  Probando: ${endpoint}`);
        const resp = await fetch(endpoint.replace('/api', '/'));
        if (resp.ok) {
          console.log(`  ✅ Funciona con: ${endpoint}`);
          window.API_URL = endpoint;
          window.API_BASE = endpoint.replace('/api', '');
          return true;
        }
      } catch (e) {
        console.log(`  ❌ Fallo: ${endpoint}`);
      }
    }
    
    return false;
  }
}

// Ejecutar verificación al cargar la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAPIConnection);
} else {
  checkAPIConnection();
}