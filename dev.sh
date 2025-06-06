#!/bin/bash

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Función para mostrar mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Detener contenedores existentes
print_message "Deteniendo contenedores existentes..."
docker-compose down

# Construir y levantar contenedores
print_message "Construyendo y levantando contenedores..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
print_message "Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los contenedores
print_message "Verificando estado de los contenedores..."
docker-compose ps

print_message "Servicios disponibles en:"
print_message "Frontend: http://localhost:3000"
print_message "Backend: http://localhost:3001"
print_message "Base de datos: localhost:5433"

# Mostrar logs
print_message "Mostrando logs..."
docker-compose logs -f 