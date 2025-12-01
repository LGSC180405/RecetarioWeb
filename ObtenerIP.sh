#!/bin/bash

# Script para obtener la IP de tu servidor en la red local

echo "🔍 Detectando IPs de tu servidor..."
echo ""
echo "IPs disponibles en tu sistema:"
echo "================================"

# Obtener todas las IPs (excepto loopback)
ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1'

echo ""
echo "📝 Tu IP principal probablemente es:"
# Obtener IP principal (generalmente la primera que no es loopback)
IP_PRINCIPAL=$(ip route get 1 | awk '{print $NF;exit}' 2>/dev/null || hostname -I | awk '{print $1}')
echo "   $IP_PRINCIPAL"

echo ""
echo "✅ Usa esta IP para configurar tu aplicación"
echo ""
echo "Para Windows/Mac, puedes usar:"
echo "  - Windows: ipconfig"
echo "  - Mac: ifconfig | grep inet"