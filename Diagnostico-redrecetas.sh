#!/bin/bash

# Script de diagnóstico y configuración para RedRecetas
# Ejecuta este script para diagnosticar y solucionar problemas de conexión

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     DIAGNÓSTICO Y CONFIGURACIÓN DE REDRECETAS              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para obtener la IP principal
get_primary_ip() {
    if command -v ip &> /dev/null; then
        ip route get 1 | awk '{print $NF;exit}' 2>/dev/null
    elif command -v hostname &> /dev/null; then
        hostname -I | awk '{print $1}'
    elif command -v ifconfig &> /dev/null; then
        ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n1
    else
        echo "No disponible"
    fi
}

# 1. Detectar IP del servidor
echo "1️⃣  DETECTANDO IP DEL SERVIDOR"
echo "================================"
SERVER_IP=$(get_primary_ip)
echo -e "   Tu IP principal es: ${GREEN}$SERVER_IP${NC}"
echo ""

# 2. Verificar Docker
echo "2️⃣  VERIFICANDO DOCKER"
echo "====================="
if command -v docker &> /dev/null; then
    echo -e "   ✅ Docker está instalado"
    docker --version
else
    echo -e "   ${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    echo -e "   ✅ Docker Compose está instalado"
    docker-compose --version
else
    echo -e "   ${YELLOW}⚠️ Docker Compose no está instalado como comando separado${NC}"
    echo "   Intentando con 'docker compose'..."
    if docker compose version &> /dev/null; then
        echo -e "   ✅ Docker Compose (integrado) está disponible"
    else
        echo -e "   ${RED}❌ Docker Compose no está disponible${NC}"
        exit 1
    fi
fi
echo ""

# 3. Verificar contenedores
echo "3️⃣  VERIFICANDO CONTENEDORES"
echo "============================="
echo "   Contenedores en ejecución:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep redrecetas || echo "   No hay contenedores de RedRecetas en ejecución"
echo ""

# 4. Verificar puertos
echo "4️⃣  VERIFICANDO PUERTOS"
echo "======================"
for port in 3000 8080 27017; do
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port " || lsof -i:$port &>/dev/null; then
        echo -e "   ✅ Puerto $port está en uso"
    else
        echo -e "   ${YELLOW}⚠️ Puerto $port no está en uso${NC}"
    fi
done
echo ""

# 5. Actualizar config.js
echo "5️⃣  ACTUALIZANDO CONFIGURACIÓN"
echo "==============================="
if [ -f "public/js/config.js" ]; then
    echo "   Respaldando config.js original..."
    cp public/js/config.js public/js/config.js.backup.$(date +%Y%m%d_%H%M%S)
    
    echo "   Actualizando IP en config.js a $SERVER_IP..."
    sed -i "s/const SERVER_IP = '.*'/const SERVER_IP = '$SERVER_IP'/" public/js/config.js 2>/dev/null || \
    sed -i '' "s/const SERVER_IP = '.*'/const SERVER_IP = '$SERVER_IP'/" public/js/config.js 2>/dev/null || \
    echo -e "   ${YELLOW}⚠️ No se pudo actualizar automáticamente. Actualiza manualmente la IP en config.js${NC}"
    
    echo -e "   ${GREEN}✅ Configuración actualizada${NC}"
else
    echo -e "   ${YELLOW}⚠️ No se encontró public/js/config.js${NC}"
fi
echo ""

# 6. Probar conectividad
echo "6️⃣  PROBANDO CONECTIVIDAD"
echo "========================="
echo "   Probando endpoints:"

# Probar API directa
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200\|301\|302"; then
    echo -e "   ✅ API en localhost:3000 responde"
else
    echo -e "   ${RED}❌ API en localhost:3000 no responde${NC}"
fi

# Probar nginx
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q "200\|301\|302\|304"; then
    echo -e "   ✅ Nginx en localhost:8080 responde"
else
    echo -e "   ${YELLOW}⚠️ Nginx en localhost:8080 no responde${NC}"
fi

# Probar desde IP de red
if curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP:3000/ | grep -q "200\|301\|302"; then
    echo -e "   ✅ API en $SERVER_IP:3000 responde"
else
    echo -e "   ${YELLOW}⚠️ API en $SERVER_IP:3000 no responde desde red${NC}"
fi
echo ""

# 7. Instrucciones para otros dispositivos
echo "7️⃣  INSTRUCCIONES PARA CONECTAR DESDE OTROS DISPOSITIVOS"
echo "========================================================="
echo ""
echo -e "${GREEN}Para acceder desde otras computadoras en la misma red:${NC}"
echo ""
echo "   1. Asegúrate de que el firewall permita los puertos 3000 y 8080"
echo "      Ubuntu/Debian: sudo ufw allow 3000 && sudo ufw allow 8080"
echo "      CentOS/RHEL: sudo firewall-cmd --add-port={3000,8080}/tcp --permanent && sudo firewall-cmd --reload"
echo ""
echo "   2. Desde otras computadoras, accede a:"
echo -e "      ${GREEN}http://$SERVER_IP:8080${NC} (interfaz web via nginx)"
echo -e "      ${GREEN}http://$SERVER_IP:3000/api${NC} (API directa)"
echo ""
echo "   3. Si sigues teniendo problemas, verifica:"
echo "      - Que ambos dispositivos estén en la misma red"
echo "      - Que no haya firewall bloqueando la conexión"
echo "      - Que los contenedores estén ejecutándose (docker ps)"
echo ""

# 8. Comandos útiles
echo "8️⃣  COMANDOS ÚTILES"
echo "==================="
echo ""
echo "   # Reiniciar contenedores:"
echo "   docker-compose down && docker-compose up -d"
echo ""
echo "   # Ver logs:"
echo "   docker-compose logs -f"
echo ""
echo "   # Ver logs de un servicio específico:"
echo "   docker-compose logs -f api"
echo "   docker-compose logs -f web"
echo "   docker-compose logs -f mongo"
echo ""
echo "   # Reconstruir contenedores:"
echo "   docker-compose down"
echo "   docker-compose build --no-cache"
echo "   docker-compose up -d"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                 DIAGNÓSTICO COMPLETADO                      ║"
echo "╚════════════════════════════════════════════════════════════╝"