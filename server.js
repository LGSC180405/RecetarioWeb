const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Configuración mejorada de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman o aplicaciones móviles)
    if (!origin) return callback(null, true);
    
    // En desarrollo, permitir cualquier origen
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // En producción, puedes especificar dominios permitidos
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:3000',
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,  // Permitir cualquier IP local
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,  // Redes 10.x.x.x
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$/  // Redes 172.16-31.x.x
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS bloqueado para:', origin);
      callback(null, true); // En desarrollo, solo logear pero permitir
      // callback(new Error('Not allowed by CORS')); // En producción, bloquear
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);
app.use(express.static('public'));

// Endpoint de prueba para verificar que la API está funcionando
app.get('/', (req, res) => {
  res.json({ 
    message: 'API RedRecetas funcionando',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Servir archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/recetas', require('./routes/recetas'));
app.use('/api/valoraciones', require('./routes/valoraciones'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/comentariosBlog', require('./routes/comentarios'));
app.use('/api/auth', require('./routes/auth'));

// Endpoint de prueba para verificar conectividad
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    api: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use(errorHandler);

// Información de inicio
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📡 API disponible en http://localhost:${port}/api`);
  console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ CORS configurado para permitir conexiones de red local`);
  
  // Mostrar IPs disponibles
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  console.log('\n📍 Tu servidor está disponible en:');
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`   http://${net.address}:${port}`);
      }
    }
  }
});

// Agregar mongoose para el health check (si no está importado)
const mongoose = require('mongoose');