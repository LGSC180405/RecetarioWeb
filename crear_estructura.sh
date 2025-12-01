#!/bin/bash

# Script para crear estructura de carpetas RedRecetas (estructura modular)

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║      📁 CREAR ESTRUCTURA DE CARPETAS - REDRECETAS 📁       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Crear carpetas principales
echo -e "${BLUE}🔧 Creando carpetas principales...${NC}"
mkdir -p config middleware routes models frontend/dist/css frontend/dist/js frontend/dist/img
touch server.js .env
echo -e "${GREEN}✅ Carpetas creadas${NC}"

# Crear archivos base
echo -e "${BLUE}📝 Creando archivos base...${NC}"

# Configuración DB
cat > config/db.js << 'EOF'
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB');
  } catch (err) {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
EOF

# Middleware logger
cat > middleware/logger.js << 'EOF'
module.exports = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};
EOF

# Middleware errorHandler
cat > middleware/errorHandler.js << 'EOF'
module.exports = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message });
};
EOF

# Middleware multerConfig
cat > middleware/multerConfig.js << 'EOF'
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) cb(null, true);
  else cb(new Error('Solo se permiten archivos de imagen'));
};

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});
EOF

echo -e "${GREEN}✅ Archivos base creados${NC}"

# Crear index.html de ejemplo
cat > frontend/dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>RedRecetas</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <h1>🍽️ Bienvenido a RedRecetas</h1>
  <script src="js/config.js"></script>
</body>
</html>
EOF

# Crear config.js
cat > frontend/dist/js/config.js << 'EOF'
// Configuración de la API para RedRecetas
const API_CONFIG = {
  LOCAL: 'http://localhost:3000/api',
  NETWORK: 'http://LOCAL_IP_PLACEHOLDER:3000/api',
  get BASE