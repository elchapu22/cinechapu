FROM node:20-alpine

# Instalar dependencias del sistema necesarias para compilar
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Crear el directorio de datos para la ruta persistente que pide tu código
RUN mkdir -p /app/data

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código y asegurar que la base de datos quede en /app/data/
COPY . .
RUN if [ -f cinechapu.db ]; then cp cinechapu.db /app/data/cinechapu.db; fi

# Compilar la aplicación Next.js
RUN npm run build

EXPOSE 10000
ENV PORT=10000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]