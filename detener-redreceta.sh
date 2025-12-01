#!/bin/bash

# Script para detener RedRecetas en Kali Linux

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🛑 DETENER SERVICIOS - RED RECETAS 🛑             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${YELLOW}⚠️  Esta acción detendrá todos los servicios de RedRecetas${NC}"
echo ""
read -p "¿Continuar? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "Operación cancelada"
    exit 0
fi

echo ""
echo -e "${CYAN}🛑 Deteniendo servicios...${NC}"

# Opción para eliminar también los volúmenes
echo ""
read -p "¿Eliminar también la base de datos? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${RED}⚠️  Esto eliminará TODOS los datos de la base de datos${NC}"
    read -p "¿Estás seguro? (s/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        sudo docker-compose down -v
        echo ""
        echo -e "${GREEN}✅ Servicios detenidos y datos eliminados${NC}"
    else
        sudo docker-compose down
        echo ""
        echo -e "${GREEN}✅ Servicios detenidos (datos conservados)${NC}"
    fi
else
    sudo docker-compose down
    echo ""
    echo -e "${GREEN}✅ Servicios detenidos (datos conservados)${NC}"
fi

echo ""
echo -e "${CYAN}📋 Para volver a iniciar:${NC}"
echo "   ./iniciar-redrecetas.sh"
echo ""