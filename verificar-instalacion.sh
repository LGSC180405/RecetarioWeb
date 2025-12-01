#!/bin/bash

# Script de verificación para Kali Linux

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🔍 VERIFICADOR DE INSTALACIÓN - RED RECETAS 🔍        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

errores=0

echo -e "${BLUE}📂 Verificando archivos necesarios...${NC}"
echo ""

# Verificar archivos principales
archivos=(
    "Dockerfile"
    "docker-compose.yml"
    "init-mongo.js"
    "nginx.conf"
    "server.js"
    "package.json"
)

for archivo in "${archivos[@]}"; do
    if [ -f "$archivo" ]; then
        echo -e "${GREEN}✓ $archivo encontrado${NC}"
    else
        echo -e "${RED}✗ $archivo NO encontrado${NC}"
        ((errores++))
    fi
done

if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env encontrado${NC}"
else
    echo -e "${YELLOW}✗ .env NO encontrado (se creará automáticamente)${NC}"
fi

if [ -d "frontend/dist" ]; then
    echo -e "${GREEN}✓ frontend/dist encontrado${NC}"
else
    echo -e "${RED}✗ frontend/dist NO encontrado - CRÍTICO${NC}"
    ((errores++))
fi

if [ -f "frontend/dist/js/config.js" ]; then
    echo -e "${GREEN}✓ js/config.js encontrado${NC}"
else
    echo -e "${RED}✗ js/config.js NO encontrado - IMPORTANTE${NC}"
    echo "  Debes crear este archivo con la configuración de la API"
    ((errores++))
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Verificar Docker
echo -e "${BLUE}🐳 Verificando Docker...${NC}"
echo ""

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker está instalado${NC}"
    docker --version
else
    echo -e "${RED}✗ Docker NO está instalado${NC}"
    ((errores++))
fi

if sudo systemctl is-active --quiet docker; then
    echo -e "${GREEN}✓ Docker está corriendo${NC}"
else
    echo -e "${RED}✗ Docker NO está corriendo${NC}"
    echo "  Inícialo con: sudo systemctl start docker"
    ((errores++))
fi

if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓ docker-compose está instalado${NC}"
else
    echo -e "${RED}✗ docker-compose NO está instalado${NC}"
    ((errores++))
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Verificar servicios si están corriendo
echo -e "${BLUE}🔍 Verificando servicios (si están corriendo)...${NC}"
echo ""

if sudo docker ps &> /dev/null; then
    if sudo docker ps | grep -q "mongo_redrecetas"; then
        echo -e "${GREEN}✓ MongoDB está corriendo${NC}"
    else
        echo -e "${YELLOW}⚠ MongoDB no está corriendo${NC}"
    fi
    
    if sudo docker ps | grep -q "api_redrecetas"; then
        echo -e "${GREEN}✓ API está corriendo${NC}"
    else
        echo -e "${YELLOW}⚠ API no está corriendo${NC}"
    fi
    
    if sudo docker ps | grep -q "web_redrecetas"; then
        echo -e "${GREEN}✓ Web está corriendo${NC}"
    else
        echo -e "${YELLOW}⚠ Web no está corriendo${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No hay servicios corriendo actualmente${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Verificar conectividad de red
echo -e "${BLUE}🌐 Verificando configuración de red...${NC}"
echo ""

LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}' | head -n1)

if [ -n "$LOCAL_IP" ]; then
    echo "Tu IP actual: $LOCAL_IP"
else
    echo -e "${YELLOW}⚠ No se pudo detectar la IP local${NC}"
fi

echo ""

# Verificar puertos
echo -e "${BLUE}📡 Verificando puertos...${NC}"
echo ""

if sudo netstat -tuln | grep -q ":3000"; then
    echo -e "${GREEN}✓ Puerto 3000 (API) está en uso${NC}"
else
    echo -e "${YELLOW}⚠ Puerto 3000 (API) está libre${NC}"
fi

if sudo netstat -tuln | grep -q ":8080"; then
    echo -e "${GREEN}✓ Puerto 8080 (Web) está en uso${NC}"
else
    echo -e "${YELLOW}⚠ Puerto 8080 (Web) está libre${NC}"
fi

if sudo netstat -tuln | grep -q ":27017"; then
    echo -e "${GREEN}✓ Puerto 27017 (MongoDB) está en uso${NC}"
else
    echo -e "${YELLOW}⚠ Puerto 27017 (MongoDB) está libre${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Resumen
if [ $errores -eq 0 ]; then
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║          ✅ TODO CORRECTO - LISTO PARA INICIAR ✅          ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "Puedes ejecutar ./iniciar-redrecetas.sh para iniciar la aplicación"
else
    echo -e "${RED}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║     ⚠️ SE ENCONTRARON $errores PROBLEMA(S) - REVISAR ⚠️           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "Por favor corrige los errores antes de continuar"
fi

echo ""
echo -e "${CYAN}📋 URLs de acceso (cuando estén los servicios corriendo):${NC}"
echo ""
echo "   LOCAL:"
echo "   🌐 http://localhost:8080"
echo "   🔌 http://localhost:3000"
echo ""
if [ -n "$LOCAL_IP" ]; then
    echo "   RED (otras PCs):"
    echo "   🌐 http://$LOCAL_IP:8080"
    echo "   🔌 http://$LOCAL_IP:3000"
fi
echo ""