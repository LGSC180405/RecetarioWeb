#!/bin/bash

# Script de inicio para RedRecetas en Kali Linux
# Uso: ./iniciar-redrecetas.sh

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           🍽️  RED RECETAS - INICIALIZADOR 🍽️              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar si Docker está instalado
echo -e "${BLUE}[1/6] Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo ""
    echo "Para instalar Docker en Kali Linux:"
    echo "  sudo apt update"
    echo "  sudo apt install -y docker.io docker-compose"
    echo "  sudo systemctl start docker"
    echo "  sudo systemctl enable docker"
    echo "  sudo usermod -aG docker $USER"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Docker está instalado${NC}"

# Verificar si Docker está corriendo
if ! sudo systemctl is-active --quiet docker; then
    echo -e "${YELLOW}⚠️  Docker no está corriendo. Iniciando...${NC}"
    sudo systemctl start docker
    sleep 2
fi
echo -e "${GREEN}✅ Docker está corriendo${NC}"

# Verificar si docker-compose está disponible
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose no está instalado${NC}"
    echo ""
    echo "Instálalo con:"
    echo "  sudo apt install -y docker-compose"
    echo ""
    exit 1
fi

# Verificar estructura de carpetas
echo -e "${BLUE}[2/6] Verificando estructura de carpetas...${NC}"
if [ ! -d "public" ]; then
    echo -e "${RED}❌ No existe la carpeta public${NC}"
    echo ""
    echo "Ejecuta primero: ./crear-estructura.sh"
    echo ""
    exit 1
fi

if [ ! -f "public/index.html" ]; then
    echo -e "${YELLOW}⚠️  No se encontró index.html en public${NC}"
    echo "   Asegúrate de tener tus archivos HTML ahí"
    echo ""
    read -p "¿Continuar de todas formas? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Detener contenedores anteriores
echo ""
echo -e "${BLUE}[3/6] Limpiando contenedores anteriores...${NC}"
sudo docker-compose down -v 2>/dev/null
sleep 2
echo -e "${GREEN}✅ Limpieza completada${NC}"

# Construir imágenes
echo ""
echo -e "${BLUE}[4/6] Construyendo imágenes (esto puede tardar 1-2 minutos)...${NC}"
sudo docker-compose build --no-cache
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir las imágenes${NC}"
    echo ""
    echo "Revisa los errores arriba"
    exit 1
fi
echo -e "${GREEN}✅ Imágenes construidas${NC}"

# Iniciar servicios
echo ""
echo -e "${BLUE}[5/6] Iniciando servicios...${NC}"
sudo docker-compose up -d --build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al iniciar los servicios${NC}"
    echo ""
    sudo docker-compose logs
    exit 1
fi
echo -e "${GREEN}✅ Servicios iniciados${NC}"

# Esperar a que los servicios estén listos
echo ""
echo -e "${BLUE}[6/6] Esperando a que los servicios estén listos...${NC}"
echo "     Esto puede tomar 30-60 segundos..."
echo ""

intentos=0
max_intentos=12

while [ $intentos -lt $max_intentos ]; do
    intentos=$((intentos + 1))
    
    echo -e "   [Intento $intentos/$max_intentos] Verificando MongoDB..."
    if sudo docker exec mongo_redrecetas mongosh --eval "db.adminCommand('ping')" --quiet &>/dev/null; then
        echo -e "   ${GREEN}✅ MongoDB listo${NC}"
        break
    fi
    
    if [ $intentos -eq $max_intentos ]; then
        echo -e "${YELLOW}⚠️  Los servicios están tardando más de lo esperado${NC}"
        echo ""
        read -p "¿Ver logs para diagnosticar? (s/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            sudo docker-compose logs
        fi
        exit 1
    fi
    
    sleep 5
done

sleep 3

echo "   Verificando API..."
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ API lista${NC}"
else
    echo -e "   ${YELLOW}⚠️  API tardando en responder, esperando más...${NC}"
    sleep 5
    if curl -s http://localhost:3000/ > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ API lista${NC}"
    fi
fi

echo "   Verificando Web..."
if curl -s http://localhost:8080/ > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Web lista${NC}"
else
    sleep 2
    echo -e "   ${GREEN}✅ Web lista${NC}"
fi

# Verificar que la base de datos se inicializó
echo ""
echo -e "${CYAN}🔍 Verificando base de datos...${NC}"
sudo docker exec mongo_redrecetas mongosh mongodb://admin:admin@localhost:27017/RedRecetas?authSource=admin --eval "print('Usuarios:', db.usuarios.countDocuments()); print('Recetas:', db.recetas.countDocuments())" --quiet

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Verificar servicios finales
if sudo docker ps | grep -q "mongo_redrecetas"; then
    echo -e "${GREEN}✅ MongoDB: ACTIVO${NC}"
else
    echo -e "${RED}❌ MongoDB: ERROR${NC}"
fi

if sudo docker ps | grep -q "api_redrecetas"; then
    echo -e "${GREEN}✅ API: ACTIVA${NC}"
else
    echo -e "${RED}❌ API: ERROR${NC}"
fi

if sudo docker ps | grep -q "web_redrecetas"; then
    echo -e "${GREEN}✅ Web: ACTIVA${NC}"
else
    echo -e "${RED}❌ Web: ERROR${NC}"
fi

# Obtener IP local
LOCAL_IP=$(ip route get 1.1.1.1 | awk '{print $7}' | head -n1)

# Mostrar información de acceso
echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║               🎉 RED RECETAS INICIADO 🎉                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${CYAN}📍 ACCESO LOCAL (solo en esta PC):${NC}"
echo "   🌐 Web:  http://localhost:8080"
echo "   🔌 API:  http://localhost:3000"
echo ""
echo -e "${CYAN}🌐 ACCESO DESDE OTRAS PCs EN LA RED:${NC}"
echo "   🌐 Web:  http://$LOCAL_IP:8080"
echo "   🔌 API:  http://$LOCAL_IP:3000"
echo ""
echo -e "${YELLOW}📱 Comparte estas URLs con otros dispositivos en tu red${NC}"
echo ""
echo -e "${CYAN}👥 USUARIOS DE PRUEBA:${NC}"
echo "   Usuario: @chefLuis    Password: 123456"
echo "   Usuario: @gamer       Password: 654321"
echo "   Usuario: @maria_chef  Password: 123456"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   - Todas las PCs deben estar en la misma red WiFi"
echo "   - Si no funciona, verifica el firewall de Linux"
echo "   - Si los CSS no cargan, verifica que estén en frontend/dist/css/"
echo ""
echo -e "${CYAN}📋 COMANDOS ÚTILES:${NC}"
echo "   Ver logs:      sudo docker-compose logs -f"
echo "   Detener:       sudo docker-compose down"
echo "   Reiniciar:     sudo docker-compose restart"
echo "   Ver estado:    sudo docker-compose ps"
echo "   Ver BD:        sudo docker exec -it mongo_redrecetas mongosh"
echo ""

# Abrir navegador si está disponible
echo -e "${BLUE}🌐 Intentando abrir navegador...${NC}"
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8080 2>/dev/null &
elif command -v firefox &> /dev/null; then
    firefox http://localhost:8080 2>/dev/null &
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
read -p "¿Ver logs en tiempo real? (s/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    clear
    echo "Mostrando logs (Ctrl+C para salir)..."
    echo ""
    sudo docker-compose logs -f
else
    echo ""
    echo -e "${GREEN}✅ Todo listo. Puedes cerrar esta terminal.${NC}"
    echo ""
fi
